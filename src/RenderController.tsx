import React, { ReactElement, ReactNode } from "react"
import PropTypes from "prop-types"
import { debounce, isEqual, isFunction } from "underscore"

import { checkForFirstLoad } from "./utils/counting"
import { createCancellableMethod } from "./utils/general"
import { checkTargetsLoaded, startLoading } from "./utils/loading"
import { addMounted, hasBeenMounted, removeMounted } from "./utils/mounted"
import { hasControllerBeenSeen, removeControllerSeen } from "./utils/seen"
import { startUnloading } from "./utils/unloading"

import { Props, State } from ".."
import { resetAttempted } from "src/utils/attempted"

const defaultContext = {
  onRenderFirst: () => <></>,
  onRenderWithout: () => <></>,
}

export const Context = React.createContext(defaultContext)

const targetShape = PropTypes.shape({
  controllerName: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  empty: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  cached: PropTypes.bool.isRequired,
  //expiration: PropTypes.number.isRequired,
  setter: PropTypes.func.isRequired,
  getter: PropTypes.func.isRequired,
})

const skippedPathnameShape = PropTypes.shape({
  from: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  reverse: PropTypes.bool,
})

export class RenderController extends React.Component<Props, State> {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    targets: PropTypes.arrayOf(targetShape).isRequired,
    failDelay: PropTypes.number,
    renderFirst: PropTypes.func,
    renderWith: PropTypes.func,
    renderWithout: PropTypes.func,
    lastPathname: PropTypes.string.isRequired,
    currentPathname: PropTypes.string.isRequired,
    skippedPathnames: PropTypes.arrayOf(skippedPathnameShape),
    controllerName: PropTypes.string.isRequired,
  }

  static defaultProps = {
    children: null,
    skippedPathnames: [],
    renderFirst: null,
    renderWith: null,
    renderWithout: null,
    failDelay: 4000,
  }

  constructor(props: Props) {
    super(props)

    const { controllerName, failDelay } = props

    const realSetState = this.setState.bind(this)
    this.setState = (...args) => {
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
    } = createCancellableMethod((failDelay as number) * 2, () => {
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
        // finished, and is replaced with either renderWith() or
        // renderWithout().
        this.setState({ isControllerSeen: true })
      }
    }, (failDelay as number))
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
    startLoading(controllerName, targets, this.setCanceller, (bool: boolean) => {
      // Shortcut to run renderWihtout if we successfuly run getData(), but it
      // returns empty data. Normally we would have to wait for <failDelay>
      // beofre the renderWithout() method is called, but with this, we can do
      // it sooner.
      this.setState({ isControllerSeen: bool })
    })

    // Toggle the state to ensure renderFirst is changed to renderWith or
    // renderWithout.
    if (this.setControllerSeen) {
      this.setControllerSeen()
    }

    // Add this controller to the list of mounted controllers.
    addMounted(controllerName)

    // Cancel any previous calls to unsetControllerSeen for thi controller.
    if (this.cancelUnsetControllerSeen) {
      this.cancelUnsetControllerSeen()
    }
  }

  componentDidUpdate(prevProps: Props): void {
    const { targets } = this.props

    // After load is attempted, change state to render the correct output.
    //this.setControllerSeen()

    // If we have pending loads, and then we navigate away from that controller
    // before the load completes, the data will clear, and then load again.
    // To avoid this, cancel any pending loads everytime our targets change.
    if (isEqual(targets, prevProps.targets) === false) {
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
    // unsetControllerSeen() can run for this controller.
    removeMounted(controllerName)

    // Remove this controllers name from the seen controllers list to allow for
    // renderFirst() methods to work again.
    if (this.unsetControllerSeen) {
      this.unsetControllerSeen()
    }
  }

  // Control our setState method with a variable to prevent memroy leaking
  // from our debounced methods running after the components are removed.
  _isMounted = false

  // Store a set of canceller functions to run when our debounced load
  // functions should not continue due to unmounting, etc.
  cancellers: (() => void)[] = []

  cancelUnsetControllerSeen: null | (() => void) = null

  unsetControllerSeen: null | (() => void) = null

  setControllerSeen: null | (() => void) = null

  setCanceller = (controllerName: string, fn: () => void): void => {
    this.cancellers.push(fn)
  }

  runCancellers = () => {
    this.cancellers.forEach((f: () => void) => {
      if (isFunction(f)) {
        f()
      }
    })
  }

  render(): ReactElement | ReactNode {
    const {
      controllerName,
      targets,
      children,
      renderWithout,
      renderWith,
      renderFirst,
    } = this.props

    const { isControllerSeen } = this.state

    if (checkTargetsLoaded(targets) === true) {
      resetAttempted(controllerName)
      if (isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    return (
      <Context.Consumer>
        {({ onRenderFirst, onRenderWithout }): ReactNode | ReactElement => {
          // If the controller is already seen, use renderWithout since the data
          // is empty and a load was attempted, but failed to produce non-empty
          // data.
          if (isControllerSeen === true) {
            if (isFunction(renderWithout)) {
              return renderWithout()
            }
            return onRenderWithout()
          }

          // Otherwise, use renderFirst() to generate the output, until the data
          // is finally loaded and changed to non-empty.
          if (checkForFirstLoad(controllerName, targets) === true) {
            if (isFunction(renderFirst)) {
              return renderFirst()
            }
            return onRenderFirst()
          }
        }}
      </Context.Consumer>
    )
  }
}
