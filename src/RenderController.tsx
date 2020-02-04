import React, { ReactElement, ReactNode } from "react"
//import PropTypes from "prop-types"
import { debounce, isEqual, isFunction } from "underscore"

import { RenderControllerRenderProps } from "src/RenderControllerContext"
import { RenderControllerWithContextProps } from "src/RenderControllerWithContext"
import { debugMessage } from "src/utils/debug"
import { clearSkippedPathnames } from "src/utils/skipped"

//import { resetAttempted } from "src/utils/attempted"
import { FunctionType } from "./types"
import { checkForFirstLoad } from "./utils/counting"
import { createChecker } from "./utils/general"
import { checkTargetsLoaded, startLoading } from "./utils/loading"
import { addMounted, hasBeenMounted, removeMounted } from "./utils/mounted"
import {
  addControllerSeen,
  hasBeenSeen,
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

export type RenderControllerProps = RenderControllerWithContextProps &
  RenderControllerPathnames &
  RenderControllerRenderProps & {
    skippedPathnames: RenderControllerSkippedPathname[],
    controllerName: string,
    renderFirst?: () => ReactElement,
    renderWithout?: () => ReactElement,
  }

export interface RenderControllerState {
  isControllerSeen: boolean;
}

export class RenderController extends React.Component<
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

  check: undefined | (() => void)

  constructor(props: RenderControllerProps) {
    super(props)

    const { controllerName, targets } = props

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
    const isSeen = hasBeenSeen(controllerName)
    this.state = {
      isControllerSeen: isSeen,
    }
    debugMessage(`controllerName: ${controllerName}, isSeen: ${isSeen}`)

    this.check = createChecker({
      controllerName,
      delay: 2200,
      check: () => !hasBeenMounted(controllerName),
      complete: () => {
        if (this.isMountedNow) {
          return
        }

        // When its determined that this pathname combination isnt being used,
        // run some functions to clear our our local caches.
        const isPrefixMounted = hasBeenMounted(controllerName)
        if (isPrefixMounted === false) {
          clearSkippedPathnames(controllerName)
        }

        // If this component instance is currently mounted and has been mounted
        // previously, don't run the rest of this function. This prevents our
        // handler from removing itself while its about to be
        // re-used/re-rendered again.
        //const { isMountedNow } = this
        //const isMountedPreviously = hasBeenMounted(controllerName)
        //if (!isMountedNow) {
        debugMessage(`Removing controllerSeen (${controllerName})`)
        removeControllerSeen(controllerName)
        //}
      },
    })

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
      controllerName,
      lastPathname,
      currentPathname,
      skippedPathnames,
    })

    /**
     * Then, start the loading process for this render controllers targets.
     */
    startLoading({
      controllerName,
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
    addMounted(controllerName)
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
    const { controllerName } = this.props

    // Set our flag to false so setState doesn't work after this.
    this.isMountedNow = false

    // Remove this controllers name from the list of mounbted controllers so
    // unsetLoadingComplete() can run for this controller.
    removeMounted(controllerName)

    if (this.check !== undefined && isFunction(this.check)) {
      this.check()
    }

    // Before any unmounting, cancel any pending loads.
    this.runCancellers()
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
    const { controllerName, targets } = this.props
    const { isControllerSeen } = this.state
    const isFirstLoad = checkForFirstLoad({
      controllerName,
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
