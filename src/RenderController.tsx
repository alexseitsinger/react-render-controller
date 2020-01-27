import React, { ReactElement, ReactNode } from "react"
//import PropTypes from "prop-types"
import { debounce, isEqual, isFunction } from "underscore"

//import { resetAttempted } from "src/utils/attempted"
import { Context, ContextProps } from "./context"
import { LoadTarget, SkippedPathname } from "./types"
import { checkForFirstLoad } from "./utils/counting"
import { createCancellableMethod } from "./utils/general"
import { checkTargetsLoaded, startLoading } from "./utils/loading"
import { addMounted, hasBeenMounted, removeMounted } from "./utils/mounted"
import { hasControllerBeenSeen, removeControllerSeen } from "./utils/seen"
import { startUnloading } from "./utils/unloading"

export interface RenderControllerWrapperProps {
  children?: React.ReactNode | React.ReactNode[];
  targets: LoadTarget[];
  renderFirst?: () => React.ReactElement;
  renderWith?: () => React.ReactElement;
  renderWithout?: () => React.ReactElement;
  lastPathname: string;
  currentPathname: string;
  skippedPathnames: SkippedPathname[];
  controllerName: string;
}

export type RenderControllerProps = RenderControllerWrapperProps & ContextProps

export interface RenderControllerState {
  isControllerSeen: boolean;
}

export class RenderController extends React.Component<
  RenderControllerProps,
  RenderControllerState
> {
  // Control our setState method with a variable to prevent memroy leaking
  // from our debounced methods running after the components are removed.
  _isMounted = false

  // Store a set of canceller functions to run when our debounced load
  // functions should not continue due to unmounting, etc.
  cancellers: (() => void)[] = []

  setControllerSeen: null | (() => void) = null

  cancelUnsetControllerSeen: null | (() => void) = null

  unsetControllerSeen: null | (() => void) = null

  constructor(props: RenderControllerProps) {
    super(props)

    const { controllerName, targets } = props

    // Require the delay to be at least 1100ms.
    // Limit the delay to 4400ms
    const failDelay = Math.max(1100, Math.min(4400, targets.length * 1100))

    const realSetState = this.setState.bind(this)
    this.setState = (...args): void => {
      if (this._isMounted === false) {
        return
      }
      realSetState(...args)
    }

    // If this component gets re-mounted and it already has empty data, the
    // default state for isControllerSeen will be false, so the loading screen
    // will shopw. To avoid this, we track each mounted component and reset the
    // default state if its already been mounted once.
    const isControllerSeen = hasControllerBeenSeen(controllerName)
    this.state = {
      isControllerSeen,
    }

    // Create a set of methods to remove this controller name from a list of
    // mounted controllers. When this controller is mounted again, it will
    // cancel this removal. Otherwise, following a delay from unmounting, this
    // controllers name will be removed. This allows the renderFirst() method to
    // be shown again. Save these methods to the instance for use elsewhere.
    const {
      method: unsetControllerSeen,
      canceller: cancelUnsetControllerSeen,
    } = createCancellableMethod(failDelay, () => {
      if (this._isMounted === true && hasBeenMounted(controllerName) === true) {
        return
      }
      removeControllerSeen(controllerName)
    })
    this.cancelUnsetControllerSeen = cancelUnsetControllerSeen
    this.unsetControllerSeen = unsetControllerSeen

    // Save an instance method that adds this controllers name to a list of
    // controllers seen. This prevents the renderFirst() method from displaying
    // again, after the data has already been loaded, but this cmponent gets
    // re-rendered.
    this.setControllerSeen = debounce(() => {
      if (isControllerSeen === false) {
        // Toggle the components state to True so our renderFirst() method
        // finished, and is replaced with either renderWith() or renderWithout().
        this.setState({ isControllerSeen: true })
      }
    }, failDelay)
  }

  componentDidMount(): void {
    const {
      controllerName,
      targets,
      lastPathname,
      currentPathname,
      skippedPathnames,
    } = this.props

    this._isMounted = true

    // Unload previous data first, then load new data.
    startUnloading(
      controllerName,
      targets,
      lastPathname,
      currentPathname,
      skippedPathnames
    )
    startLoading({
      controllerName,
      targets,
      setCanceller: this.setCanceller,
      setControllerSeen: () => {
        const f = this.setControllerSeen
        if (f !== null && isFunction(f) === true) {
          f()
        }
      },
    })

    // Add this controller to the list of mounted controllers.
    addMounted(controllerName)

    // Cancel any previous calls to unsetControllerSeen for this controller.
    const f = this.cancelUnsetControllerSeen
    if (f !== null && isFunction(f) === true) {
      f()
    }
  }

  componentDidUpdate(prevProps: RenderControllerProps): void {
    const { targets } = this.props

    const f = this.setControllerSeen
    if (f !== null && isFunction(f)) {
      f()
    }

    // If we have pending loads, and then we navigate away from that controller
    // before the load completes, the data will clear, and then load again.
    // To avoid this, cancel any pending loads everytime our targets change.
    const isTargetsChanged = isEqual(targets, prevProps.targets)
    if (isTargetsChanged === false) {
      this.runCancellers()
    }
  }

  componentWillUnmount(): void {
    const { controllerName } = this.props

    // Set our falg to false so setState doesn't work after this.
    this._isMounted = false

    // Before any unmounting, cancel any pending loads.
    this.runCancellers()

    // Remove this controllers name from the list of mounbted controllers so
    // unsetLoadingComplete() can run for this controller.
    removeMounted(controllerName)

    // Remove this controllers name from the seen controllers list to allow for
    // renderFirst() methods to work again.
    const f = this.unsetControllerSeen
    if (f !== null && isFunction(f)) {
      f()
    }
  }

  setCanceller = (f?: () => void): void => {
    if (f !== undefined && isFunction(f)) {
      this.cancellers.push(f)
    }
  }

  runCancellers = (): void => {
    this.cancellers.forEach((f: () => void) => {
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
    if (isFunction(renderWith)) {
      return renderWith()
    }
    return children
  }

  render(): ReactNode | null {
    const { controllerName, targets } = this.props
    const { isControllerSeen } = this.state

    if (checkTargetsLoaded(targets) === true) {
      return this.renderWith()
    }

    if (
      checkForFirstLoad(controllerName, targets) === true &&
      isControllerSeen === false
    ) {
      return this.renderFirst()
    }

    return this.renderWithout()
  }
}

export function RenderControllerWrapper(
  props: RenderControllerWrapperProps
): ReactElement {
  return (
    <Context.Consumer>
      {({ onRenderFirst, onRenderWithout }): ReactNode => (
        <RenderController
          {...props}
          onRenderFirst={onRenderFirst}
          onRenderWithout={onRenderWithout}
        />
      )}
    </Context.Consumer>
  )
}
