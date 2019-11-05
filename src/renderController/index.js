import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"

import {
  hasLoadAttempted,
  addLoadAttempted,
  removeAttempted,
  resetLoadAttempted,
} from "./utils/attempts"
import {
  getLoadCount,
  resetLoadCount,
} from "./utils/counting"
import {
  runUnloaders,
  addUnloader,
} from "./utils/unloading"
import {
  runLoaders,
  addLoader,
} from "./utils/loading"
import {
  isEmpty,
  removeLeadingAndTrailingSlashes,
  getMasterName,
} from "./utils/general"

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
 *
 * @example
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
  }

  static defaultProps = {
    children: null,
    skippedPathnames: [],
    renderFirst: null,
    renderWith: null,
    renderWithout: null,
    failDelay: 6000,
    totalTargets: null,
  }

  constructor(props) {
    super(props)

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
    // default state for isLoadAttempted will be false, so the loading screen
    // will shopw. To avoid this, we track each mounted component and reset the
    // default state if its already been mounted once.
    const { currentPathname, name } = props
    const isLoadAttempted = hasLoadAttempted(currentPathname, name)
    this.state = {
      isLoadAttempted,
    }

    // After a certain delay, toggle our load attempted flag to change what gets
    // displayed (from renderFirst -> renderWithout)
    this.setLoadAttempted = _.debounce(() => {
      if (isLoadAttempted === false) {
        this.setState({ isLoadAttempted: true })
        addLoadAttempted(currentPathname, name)
      }
    }, props.failDelay)

    // Unload previous data first, then load new data.
    this.processUnloaders()
    this.processLoaders()
  }

  componentDidMount() {
    const {
      currentPathname,
      name,
    } = this.props

    this._isMounted = true

    resetLoadAttempted(currentPathname)
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

  componentWillUnmount() {
    this._isMounted = false

    // Before any unmounting, cancel any pending loads.
    this.runCancellers()
  }

  handleLoad = () => {
    const { targets } = this.props

    if (this.isTargetsLoaded() === true) {
      return
    }

    targets.forEach(obj => {
      if (this.hasTargetLoadedBefore(obj.name) === true) {
        return
      }

      obj.load()
      this.setLoadAttempted()
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
      const name = obj.name

      this.cancellers[name] = addLoader({
        name,
        currentPathname,
        handler: this.handleLoad,
        callback: () => {
          this.cancellers[name] = null
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

    if (getLoadCount(currentPathname, name) <= 0) {
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
      addUnloader({
        name: obj.name,
        handler: this.handleUnload,
        lastPathname,
        currentPathname,
        skippedPathnames,
      })
    })
  }

  isTargetsLoaded = () => {
    const { targets } = this.props
    return targets.map(obj => {
      if (!obj.data || isEmpty(obj.data) === true) {
        return false
      }
      return true
    }).every(result => result === true)
  }

  isFirstLoad = () => {
    const {
      targets,
      currentPathname,
    } = this.props

    var total = 0
    targets.forEach(obj => {
      total += getLoadCount(currentPathname, obj.name)
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
      isLoadAttempted
    } = this.state

    if (this.isTargetsLoaded() === true) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    if ((isLoadAttempted === false) && this.isFirstLoad() === true) {
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

