import React, { ReactNode } from "react"
//import PropTypes from "prop-types"
import { debounce, isEqual, isFunction } from "underscore"

import { RenderControllerRenderProps } from "src/RenderControllerContext"
import { RenderControllerWithContextInitialProps } from "src/RenderControllerWithContext"
import {
  hasCompleted,
  setCompleted,
  setUncompleted,
} from "src/utils/completing"
import { debugMessage } from "src/utils/debug"
import {
  clearSkippedPathnames,
  FinalSkippedPathname,
} from "src/utils/pathnames"

//import { resetAttempted } from "src/utils/attempted"
import { FunctionType } from "./types"
import { assertFirstLoad } from "./utils/counting"
import { createChecker, isDefined } from "./utils/general"
import { assertTargetsHaveData, startLoading } from "./utils/loading"
import { hasMounted, setMounted, setUnmounted } from "./utils/mounting"
import { startUnloading } from "./utils/unloading"

const sectionName = "controller"

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

export type RenderControllerProps = RenderControllerWithContextInitialProps &
  RenderControllerPathnames &
  RenderControllerRenderProps & {
    skippedPathnames: FinalSkippedPathname[],
  }

export interface RenderControllerState {
  isControllerCompleted: boolean;
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
  setControllerCompleted: FunctionType

  // Each time one of these components is unmounted, it invokes a debounced
  // method to run functions following its unmounting. However, if the component
  // is remounted before the timeout completes, this handler method is
  // cancelled.
  handleUnmount: FunctionType

  // Prevents the handleUnmount method from actually running. This is invoked
  // during mounting each time the component is mounted.
  cancelHandleUnmount: FunctionType

  check: () => void

  constructor(props: RenderControllerProps) {
    super(props)

    const { controllerName, targets } = props

    // Require the delay to be at least 1100ms.
    // Limit the delay to 4400ms
    const failDelay = Math.max(1100, Math.min(4400, targets.length * 1100))

    const realSetState = this.setState.bind(this)
    this.setState = (...args): void => {
      if (!this.isMountedNow) {
        return
      }
      realSetState(...args)
    }

    // If this component gets re-mounted and it already has empty data, the
    // default state for isControllerCompleted will be false, so the loading screen
    // will shopw. To avoid this, we track each mounted component and reset the
    // default state if its already been mounted once.
    const isCompleted = hasCompleted(controllerName)
    this.state = {
      isControllerCompleted: isCompleted,
    }

    this.check = createChecker({
      controllerName,
      delay: 2200,
      check: () => !hasMounted(controllerName),
      complete: () => {
        if (this.isMountedNow) {
          debugMessage({
            message: `Controller is currently mounted, so cancelling unmount process for '${controllerName}'`,
            sectionName,
          })
          return
        }

        // When its determined that this pathname combination isnt being used,
        // run some functions to clear our our local caches.
        const isPrefixMounted = hasMounted(controllerName)
        if (!isPrefixMounted) {
          clearSkippedPathnames(controllerName)
        }

        // If this component instance is currently mounted and has been mounted
        // previously, don't run the rest of this function. This prevents our
        // handler from removing itself while its about to be
        // re-used/re-rendered again.
        //const { isMountedNow } = this
        //const isMountedPreviously = hasMounted(controllerName)
        //if (!isMountedNow) {
        setUncompleted(controllerName)
        //}
      },
    })

    // Save an instance method that adds this controllers name to a list of
    // controllers seen. This prevents the renderFirst() method from displaying
    // again, after the data has already been loaded, but this cmponent gets
    // re-rendered.
    this.setControllerCompleted = debounce(() => {
      const { isControllerCompleted } = this.state
      if (isControllerCompleted) {
        debugMessage({
          message: `'${controllerName}' is already completed.`,
          sectionName,
        })
        return
      }

      setCompleted(controllerName)

      // Toggle the components state to True so our renderFirst() method
      // finished, and is replaced with either renderWith() or renderWithout().
      this.setState({ isControllerCompleted: true })
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

    debugMessage({
      message: `Mounting controller '${controllerName}'`,
      sectionName,
    })

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
      addCanceller: this.addCanceller,
      setControllerCompleted: () => {
        const f = this.setControllerCompleted
        if (isDefined(f) && isFunction(f)) {
          f()
        }
      },
    })

    // Add this controller to the list of mounted controllers.
    setMounted(controllerName)
  }

  componentDidUpdate(prevProps: RenderControllerProps): void {
    const { targets, controllerName } = this.props

    debugMessage({
      message: `Updating controller '${controllerName}'`,
      sectionName,
    })

    const f = this.setControllerCompleted
    if (isDefined(f) && isFunction(f)) {
      f()
    }

    // If we have pending loads, and then we navigate away from that controller
    // before the load completes, the data will clear, and then load again.
    // To avoid this, cancel any pending loads everytime our targets change.
    if (!isEqual(targets, prevProps.targets)) {
      this.runCancellers()
    }
  }

  componentWillUnmount(): void {
    const { controllerName } = this.props

    // Set our flag to false so setState doesn't work after this.
    this.isMountedNow = false

    // Remove this controllers name from the list of mounbted controllers so
    // check() can run for this controller (if its finally unmounted).
    setUnmounted(controllerName)

    const f = this.check
    if (isDefined(f) && isFunction(f)) {
      f()
    }

    // Before any unmounting, cancel any pending loads.
    this.runCancellers()
  }

  addCanceller = (f?: FunctionType): void => {
    if (isDefined(f) && isFunction(f)) {
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

    if (isDefined(onRenderFirst) && isFunction(onRenderFirst)) {
      return onRenderFirst()
    }

    return null
  }

  renderWithout = (): ReactNode | null => {
    const { renderWithout, onRenderWithout } = this.props

    if (isFunction(renderWithout)) {
      return renderWithout()
    }

    if (isDefined(onRenderWithout) && isFunction(onRenderWithout)) {
      return onRenderWithout()
    }

    return null
  }

  renderWith = (): ReactNode => {
    const { renderWith, children } = this.props

    if (isDefined(renderWith) && isFunction(renderWith)) {
      return renderWith()
    }

    return children
  }

  render(): ReactNode | null {
    const { controllerName, targets } = this.props
    const { isControllerCompleted } = this.state
    const isFirstLoad = assertFirstLoad(controllerName, targets)
    const isTargetsHaveData = assertTargetsHaveData(targets)

    if (isFirstLoad && !isControllerCompleted) {
      debugMessage({
        message: `First render for '${controllerName}'`,
        sectionName,
      })
      return this.renderFirst()
    }

    if (isTargetsHaveData) {
      debugMessage({
        message: `Rendering '${controllerName}' with data`,
        sectionName,
      })
      return this.renderWith()
    }

    debugMessage({
      message: `Rendering '${controllerName}' without data`,
      sectionName,
    })
    return this.renderWithout()
  }
}
