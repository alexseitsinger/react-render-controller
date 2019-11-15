import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"

import {
  isEmpty,
  removeLeadingAndTrailingSlashes,
  getMasterName,
  createCancellableMethod,
} from "./utils/general"
import {
  getLoadCount,
  resetLoadCount,
} from "./utils/counting"
import {
  hasControllerBeenSeen,
  addControllerSeen,
  removeControllerSeen,
} from "./utils/seen"
import {
  addMounted,
  removeMounted,
  hasBeenMounted,
} from "./utils/mounted"
import {
  runUnloaders,
  addUnloader,
} from "./utils/unloading"
import {
  runLoaders,
  addLoader,
} from "./utils/loading"

/**
 * Renders a component after its data has loaded.
 *
 * @param {object} props
 * @param {array} props.targets
 * @param {function} [props.children]
 * @param {function} [props.renderFirst]
 * @param {function} [props.renderWith]
 * @param {function} [props.renderWithout]
 * @param {string} props.lastPathname
 * @param {string} props.currentPathname
 * @param {array} [props.skippedPathnames]
 * @param {number} [props.failDelay]
 * @param {number} [props.totalTargets]
 */
export class RenderController extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
    targets: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
      ]),
      load: PropTypes.func.isRequired,
      unload: PropTypes.func,
    })).isRequired,
    failDelay: PropTypes.number,
    renderFirst: PropTypes.func,
    renderWith: PropTypes.func,
    renderWithout: PropTypes.func,
    lastPathname: PropTypes.string.isRequired,
    currentPathname: PropTypes.string.isRequired,
    skippedPathnames: PropTypes.arrayOf(PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    })),
    totalTargets: PropTypes.number,
    name: PropTypes.string.isRequired,
  }

  static defaultProps = {
    children: null,
    skippedPathnames: [],
    renderFirst: null,
    renderWith: null,
    renderWithout: null,
    failDelay: 6000,
    totalTargets: null,
    name: _.uniqueId(),
  }

  constructor(props) {
    super(props)

    // Use some props for the contstructor below...
    const { name, failDelay } = props

    // Store a set of canceller functions to run when our debounced load
    // functions should not continue due to unmounting, etc.
    this.cancellers = []

    // Control our setState method with a variable to prevent memroy leaking
    // from our debounced methods running after the components are removed.
    this._isMounted = false
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
    const isControllerSeen = hasControllerBeenSeen(name)
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
    } = createCancellableMethod((failDelay * 2), () => {
      if (isControllerSeen === true) {
        if (this.isControllerMounted() === false) {
          removeControllerSeen(name)
        }
      }
    })
    this.cancelUnsetControllerSeen = cancelUnsetControllerSeen
    this.unsetControllerSeen = unsetControllerSeen

    // Save an instance method that adds this controllers name to a list of
    // controllers seen. This prevents the renderFirst() method from displaying
    // again, after the data has already been loaded, but this cmponent gets
    // re-rendered.
    this.setControllerSeen = _.debounce(() => {
      if (isControllerSeen === false) {
        addControllerSeen(name)

        // Toggle the components state to True so our renderFirst() method
        // finished, and is replaced with either renderWith() or
        // renderWithout().
        this.setState({ isControllerSeen: true })
      }
    }, failDelay)


    // Unload previous data first, then load new data.
    this.processUnloaders()
    this.processLoaders()
  }

  componentWillUnmount() {
    // Set our falg to false so setState doesn't work after this.
    this._isMounted = false

    // Remove this controllers name from the list of mounbted controllers so
    // unsetControllerSeen() can run for this controller.
    const { name } = this.props
    removeMounted(name)

    // Before any unmounting, cancel any pending loads.
    this.runCancellers()

    // Remove this controllers name from the seen controllers list to allow for
    // renderFirst() methods to work again.
    this.unsetControllerSeen()
  }

  componentDidMount() {
    const {
      name,
    } = this.props

    // Set the flag to allow setState to work.
    this._isMounted = true

    // Add this controller to the list of mounted controllers.
    addMounted(name)

    // Cancel any previous calls to unsetControllerSeen for thi controller.
    this.cancelUnsetControllerSeen()

    // Add this controller to the list of seen controllers.
    this.setControllerSeen()
  }

  componentDidUpdate(prevProps) {
    const { targets } = this.props

    // If we have pending loads, and then we navigate away from that controller
    // before the load completes, the data will clear, and then load again.
    // To avoid this, cancel any pending loads everytime our targets change.
    if (_.isEqual(targets, prevProps.targets) === false) {
      this.runCancellers()
    }
  }

  getFullTargetName = targetName => {
    const { name } = this.props
    return `${name}_${targetName}`
  }

  isControllerMounted = () => {
    const { name } = this.props

    if (this._isMounted === true && hasBeenMounted(name) === true) {
      return true
    }

    return false
  }

  handleLoad = () => {
    const { targets, name } = this.props

    if (this.isTargetsLoaded() === true) {
      return
    }

    targets.forEach((obj, i) => {
      if (this.hasTargetLoadedBefore(obj.name) === true) {
        return
      }

      obj.load()
    })
  }

  handleUnload = () => {
    const {
      targets,
      currentPathname,
    } = this.props

    targets.forEach(obj => {
      if (_.isFunction(obj.unload)) {
        obj.unload()
      }

      resetLoadCount(currentPathname, obj.name)
    })
  }

  getTotalTargets = () => {
    const {
      totalTargets,
      targets,
    } = this.props

    if (!totalTargets) {
      return targets.length
    }
    return totalTargets
  }

  processLoaders = () => {
    const {
      targets,
      currentPathname,
    } = this.props

    targets.forEach((obj, i, arr) => {
      const fullTargetName = this.getFullTargetName(obj.name)

      this.cancellers[fullTargetName] = addLoader({
        name: fullTargetName,
        currentPathname,
        handler: this.handleLoad,
        callback: () => {
          this.cancellers[fullTargetName] = null
        },
      })

      if (arr.length === (i + 1)) {
        runLoaders(currentPathname)
      }
    })
  }

  runCancellers = () => {
    this.cancellers.forEach(f => {
      if (_.isFunction(f)) {
        f()
      }
    })
  }

  hasTargetLoadedBefore = name => {
    const {
      currentPathname,
    } = this.props

    const fullTargetName = this.getFullTargetName(name)
    if (getLoadCount(currentPathname, fullTargetName) <= 0) {
      return false
    }
    return true
  }

  processUnloaders = () => {
    const {
      targets,
      lastPathname,
      currentPathname,
      skippedPathnames,
    } = this.props

    runUnloaders(lastPathname, currentPathname)

    targets.forEach(obj => {
      const fullTargetName = this.getFullTargetName(obj.name)

      addUnloader({
        name: fullTargetName,
        handler: this.handleUnload,
        lastPathname,
        currentPathname,
        skippedPathnames,
      })
    })
  }

  hasTargetLoaded = obj => {
    if (!obj.data || isEmpty(obj.data) === true) {
      return false
    }
    return true
  }

  isTargetsLoaded = () => {
    const { targets } = this.props
    return targets.map(obj => this.hasTargetLoaded(obj)).every(result => result === true)
  }

  isFirstLoad = () => {
    const {
      targets,
      currentPathname,
    } = this.props

    var total = 0
    targets.forEach(obj => {
      const fullTargetName = this.getFullTargetName(obj.name)
      total += getLoadCount(currentPathname, fullTargetName)
    })

    if (total <= 0) {
      return true
    }
    return false
  }

  render() {
    const {
      children,
      renderWithout,
      renderWith,
      renderFirst,
    } = this.props

    const {
      isControllerSeen
    } = this.state

    if (this.isTargetsLoaded() === true) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    const isFirstLoad = this.isFirstLoad()
    if (isFirstLoad === true && isControllerSeen === false) {
      if (_.isFunction(renderFirst)) {
        return renderFirst()
      }
    }

    if (_.isFunction(renderWithout)) {
      return renderWithout()
    }
    return null
  }
}

