import React, { ReactElement, ReactNode } from "react"
//import PropTypes from "prop-types"
import { debounce, isArray, isEqual, isFunction } from "underscore"

import { debugMessage } from "src/utils/debug"
import { clearSkippedPathnames, getSkippedPathnames } from "src/utils/skipped"

import {
  RenderControllerContext,
  RenderControllerContextRenderMethods,
} from "./RenderControllerContext"
//import { resetAttempted } from "src/utils/attempted"
import { ChildrenType, FunctionType, RenderFunctionType } from "./types"
import { checkForFirstLoad } from "./utils/counting"
import {
  createCancellableMethod,
  getControllerName,
  getControllerNamePrefix,
} from "./utils/general"
import { checkTargetsLoaded, startLoading } from "./utils/loading"
import { addMounted, hasBeenMounted, removeMounted } from "./utils/mounted"
import {
  addControllerSeen,
  hasControllerBeenSeen,
  removeControllerSeen,
} from "./utils/seen"
import { startUnloading } from "./utils/unloading"

export interface RenderControllerSkippedPathname {
  from: string;
  to: string;
  reverse?: boolean;
}

export type RenderControllerTargetData = any[] | { [key: string]: any }

export interface RenderControllerTarget {
  name: string;
  data: RenderControllerTargetData;
  getter: FunctionType;
  setter: FunctionType;
  empty: {} | [];
  excluded?: string[];
  forced?: boolean;
  cached?: boolean;
  attempted?: boolean;
}

export interface RenderControllerPathnames {
  lastPathname: string;
  currentPathname: string;
}

export interface RenderControllerWithContextProps {
  children?: ChildrenType;
  targets: RenderControllerTarget[];
  renderWith?: RenderFunctionType;
  renderWithout?: RenderFunctionType;
  renderFirst?: RenderFunctionType;
  skippedPathnames?: RenderControllerSkippedPathname[];
}

export type RenderControllerProps = RenderControllerWithContextProps &
  RenderControllerPathnames &
  RenderControllerContextRenderMethods & {
    skippedPathnames: RenderControllerSkippedPathname[],
    controllerName: string,
    controllerNamePrefix: string,
  }

export interface RenderControllerState {
  isControllerSeen: boolean;
}

class RenderController extends React.Component<
  RenderControllerProps,
  RenderControllerState
> {
  // Control our setState method with a variable to prevent memroy leaking
  // from our debounced methods running after the components are removed.
  isMountedNow = false

  // Store a set of canceller functions to run when our debounced load
  // functions should not continue due to unmounting, etc.
  cancellers: FunctionType[] = []

  // Once a component has been mounted, we toggle a local state variable to
  // change the rendered output from renderFirst() to either renderWith() or
  // renderWithout()
  setControllerSeen: undefined | FunctionType = undefined

  // Each time one of these components is unmounted, it invokes a debounced
  // method to run functions following its unmounting. However, if the component
  // is remounted before the timeout completes, this handler method is
  // cancelled.
  handleUnmount: undefined | FunctionType = undefined

  // Prevents the handleUnmount method from actually running. This is invoked
  // during mounting each time the component is mounted.
  cancelHandleUnmount: undefined | FunctionType = undefined

  constructor(props: RenderControllerProps) {
    super(props)

    const { controllerName, controllerNamePrefix, targets } = props

    // Require the delay to be at least 1100ms.
    // Limit the delay to 4400ms
    const failDelay = Math.max(1100, Math.min(4400, targets.length * 1100))

    const realSetState = this.setState.bind(this)
    this.setState = (...args): void => {
      if (this.isMountedNow === false) {
        return
      }
      realSetState(...args)
    }

    // If this component gets re-mounted and it already has empty data, the
    // default state for isControllerSeen will be false, so the loading screen
    // will shopw. To avoid this, we track each mounted component and reset the
    // default state if its already been mounted once.
    this.state = {
      isControllerSeen: hasControllerBeenSeen(controllerName),
    }

    const cancelDelay = failDelay * 1.5

    // Create a set of methods to remove this controller name from a list of
    // mounted controllers. When this controller is mounted again, it will
    // cancel this removal. Otherwise, following a delay from unmounting, this
    // controllers name will be removed. This allows the renderFirst() method to
    // be shown again. Save these methods to the instance for use elsewhere.
    const [handleUnmount, cancelHandleUnmount] = createCancellableMethod(
      cancelDelay,
      () => {
        debugMessage(`Handing unmount (${controllerName})`)
        // When its determined that this pathname combination isnt being used,
        // run some functions to clear our our local caches.
        const isPrefixMounted = hasBeenMounted(controllerNamePrefix)
        if (isPrefixMounted === false) {
          clearSkippedPathnames(controllerNamePrefix)
        }

        // If this component instance is currently mounted and has been mounted
        // previously, don't run the rest of this function. This prevents our
        // handler from removing itself while its about to be
        // re-used/re-rendered again.
        const { isMountedNow } = this
        //const isMountedPreviously = hasBeenMounted(controllerName)
        if (!isMountedNow) {
          debugMessage(`Removing controllerSeen (${controllerName})`)
          removeControllerSeen(controllerName)
        }
      }
    )
    this.handleUnmount = handleUnmount
    this.cancelHandleUnmount = cancelHandleUnmount

    // Save an instance method that adds this controllers name to a list of
    // controllers seen. This prevents the renderFirst() method from displaying
    // again, after the data has already been loaded, but this cmponent gets
    // re-rendered.
    this.setControllerSeen = debounce(() => {
      const { isControllerSeen } = this.state
      if (isControllerSeen) {
        return
      }
      debugMessage(`-> Setting isControllerSeen to true. (${controllerName})`)
      addControllerSeen(controllerName)
      // Toggle the components state to True so our renderFirst() method
      // finished, and is replaced with either renderWith() or renderWithout().
      this.setState({ isControllerSeen: true })
    }, failDelay)
  }

  componentDidMount(): void {
    const {
      targets,
      lastPathname,
      currentPathname,
      skippedPathnames,
      controllerName,
      controllerNamePrefix,
    } = this.props

    /**
     * Make sure we set the local flag to true, so our setState method works.
     */
    this.isMountedNow = true

    /**
     * First, unload any previous data from prior render controllers before we
     * attempt to load data for this currently mounted render controller.
     */
    startUnloading({
      targets,
      lastPathname,
      currentPathname,
      skippedPathnames,
    })

    /**
     * Then, start the loading process for this render controllers targets.
     */
    startLoading({
      lastPathname,
      currentPathname,
      targets,
      setCanceller: this.setCanceller,
      setControllerSeen: () => {
        const f = this.setControllerSeen
        if (f !== undefined && isFunction(f)) {
          f()
        }
      },
    })

    // Add this controller to the list of mounted controllers.
    addMounted(controllerNamePrefix)
    addMounted(controllerName)

    // Cancel any previous calls to unsetControllerSeen for this controller.
    const f = this.cancelHandleUnmount
    if (f !== undefined && isFunction(f)) {
      f()
    }
  }

  componentDidUpdate(prevProps: RenderControllerProps): void {
    const { targets } = this.props

    const f = this.setControllerSeen
    if (f !== undefined && isFunction(f)) {
      f()
    }

    // If we have pending loads, and then we navigate away from that controller
    // before the load completes, the data will clear, and then load again.
    // To avoid this, cancel any pending loads everytime our targets change.
    const isTargetsSame = isEqual(targets, prevProps.targets)
    if (isTargetsSame === false) {
      this.runCancellers()
    }
  }

  componentWillUnmount(): void {
    const { controllerName, controllerNamePrefix } = this.props

    // Set our flag to false so setState doesn't work after this.
    this.isMountedNow = false

    // Before any unmounting, cancel any pending loads.
    this.runCancellers()

    // Remove this controllers name from the list of mounbted controllers so
    // unsetLoadingComplete() can run for this controller.
    removeMounted(controllerName)
    removeMounted(controllerNamePrefix)

    // Remove this controllers name from the seen controllers list to allow for
    // renderFirst() methods to work again.
    const f = this.handleUnmount
    if (f !== undefined && isFunction(f)) {
      f()
    }
  }

  setCanceller = (f?: FunctionType): void => {
    if (f !== undefined && isFunction(f)) {
      this.cancellers.push(f)
    }
  }

  runCancellers = (): void => {
    this.cancellers.forEach((f: FunctionType) => {
      if (isFunction(f)) {
        f()
      }
    })
  }

  renderFirst = (): ReactNode | null => {
    const { renderFirst, onRenderFirst } = this.props

    if (isFunction(renderFirst)) {
      return renderFirst()
    }

    if (onRenderFirst !== undefined && isFunction(onRenderFirst)) {
      return onRenderFirst()
    }

    return null
  }

  renderWithout = (): ReactNode | null => {
    const { renderWithout, onRenderWithout } = this.props

    if (isFunction(renderWithout)) {
      return renderWithout()
    }

    if (onRenderWithout !== undefined && isFunction(onRenderWithout)) {
      return onRenderWithout()
    }

    return null
  }

  renderWith = (): ReactNode => {
    const { renderWith, children } = this.props

    if (renderWith !== undefined && isFunction(renderWith)) {
      return renderWith()
    }

    return children
  }

  render(): ReactNode | null {
    const { targets, lastPathname, currentPathname } = this.props
    const { isControllerSeen } = this.state
    const isFirstLoad = checkForFirstLoad({
      lastPathname,
      currentPathname,
      targets,
    })
    const isTargetsLoaded = checkTargetsLoaded(targets)

    if (isTargetsLoaded) {
      return this.renderWith()
    }

    if (isFirstLoad && isControllerSeen === false) {
      return this.renderFirst()
    }

    return this.renderWithout()
  }
}

export function RenderControllerWithContext(
  props: RenderControllerWithContextProps
): ReactElement {
  const { skippedPathnames, targets } = props
  /**
   * Ensure we always pass an array, empty or not, for the passed
   * skippedPathnames.
   */
  let passedSkippedPathnames: RenderControllerSkippedPathname[] = []
  if (skippedPathnames !== undefined && isArray(skippedPathnames) === true) {
    passedSkippedPathnames = [...skippedPathnames]
  }

  return (
    <RenderControllerContext.Consumer>
      {({ onRenderFirst, onRenderWithout, getPathnames }): ReactElement => {
        const { lastPathname, currentPathname } = getPathnames()
        const controllerName = getControllerName({
          lastPathname,
          currentPathname,
          targets,
        })
        /**
         * Combine skipped pathnames from parent controllers.
         */
        const controllerNamePrefix = getControllerNamePrefix({
          lastPathname,
          currentPathname,
        })
        const finalSkippedPathnames = getSkippedPathnames(
          controllerNamePrefix,
          passedSkippedPathnames
        )

        /**
         * Add any skippedPathnames explicitly passed in props after, so they
         * override anything we inherit from parent controllers.
         */
        return (
          <RenderController
            {...props}
            controllerNamePrefix={controllerNamePrefix}
            controllerName={controllerName}
            skippedPathnames={finalSkippedPathnames}
            onRenderFirst={onRenderFirst}
            onRenderWithout={onRenderWithout}
            lastPathname={lastPathname}
            currentPathname={currentPathname}
          />
        )
      }}
    </RenderControllerContext.Consumer>
  )
}
