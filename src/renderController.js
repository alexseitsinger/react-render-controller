import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"

import {
  getLoadCount,
  resetLoadCount,
} from "./counting"
import {
  runUnloaders,
  addUnloader,
} from "./unloading"
import {
  runLoaders,
  addLoader,
} from "./loading"
import {
  isEmpty,
} from "./utils"

/**
 * Renders a component after its data has loaded.
 *
 * @param {object} props
 * @param {array} props.targets
 * Objects to load data for with their respective loaders & unloaders.
 * @param {function} [props.children]
 * Component(s) to render when data is non-empty.
 * @param {function} [props.renderFirst]
 * Function to invoke to render when data loading starts and is currently empty.
 * @param {function} [props.renderWith]
 * Function to invoke to render when data is loaded and non-empty.
 * @param {function} [props.renderWithout]
 * Function to invoke when data loading fails to produce non-empty data.
 * @param {string} [props.lastPathname]
 * The previous page's pathname.
 * @param {string} [props.currentPathname]
 * The current page's pathname.
 * @param {array} [props.skippedPathnames]
 * The pathnames to skip unloading for.
 *
 * @example
 * import { RenderController } from "@alexseitsinger/react-render-controller"
 *
 * function PageOne({
 *    pageData, getPageData, setPageData, last, current,
 * }) {
 *   return (
 *     <RenderController
 *       targets={[
 *         {
 *           name: "data",
 *           data: pageData,
 *           load: () => getPageData(),
 *           unload: () => setPageData({}),
 *         }
 *       ]}
 *       lastPathname={last.pathname}
 *       currentPathname={current.pathname}
 *       skippedPathnames={[
 *         {
 *           from: "/about",
 *           to: "/",
 *         },
 *         {
 *            from: "/",
 *            to: "/about",
 *         },
 *       ]}
 *       renderFirst={() => (
 *          <div>Loading page data...</div>
 *       )}
 *       renderWith={() => (
 *          pageData.map((obj, i) => {
 *            const key = "data" + i.toString()
 *            return (
 *              <div key={key}>{obj.name}</div>
 *            )
 *          })
 *       )}
 *       renderWithout={() => (
 *          <div>No page data</div>
 *       )}
 *     />
 *   )
 * }
 *
 * const mapState = state => ({
*     pageData: state.pageData,
*     locations: state.locations,
 * })
 *
 * const mapDispatch = dispatch => ({
 *    getPageData: () => dispatch(getPageData()),
 *    setPageData: obj => dispatch(setPageData(obj)),
 * })
 *
 * export default connect(mapState, mapDispatch)(PageOne)
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
    totalLoaders: PropTypes.number,
  }

  static defaultProps = {
    children: null,
    skippedPathnames: [],
    renderFirst: null,
    renderWith: null,
    renderWithout: null,
    failDelay: 6000,
    totalLoaders: 1,
  }

  state = {
    isLoadAttempted: false,
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

    // After a certain delay, toggle our load attempted flag to change what gets
    // displayed (from renderFirst -> renderWithout)
    this.setLoadAttempted = _.debounce(() => {
      this.setState({ isLoadAttempted: true })
    }, props.failDelay)

    // Unload previous data first, then load new data.
    this.processUnloaders()
    this.processLoaders()
  }

  componentDidMount() {
    this._isMounted = true
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

    if (this.isTargetsLoaded() === false) {
      targets.forEach(obj => {
        if (this.hasTargetLoadedBefore(obj.name) === false) {
          obj.load()
          this.setLoadAttempted()
        }
      })
    }
  }

  handleUnload = () => {
    const { targets } = this.props

    targets.forEach(obj => {
      if (_.isFunction(obj.unload)) {
        obj.unload()
      }

      const targetName = this.getTargetName(obj.name)
      resetLoadCount(targetName)
    })
  }

  processLoaders = () => {
    const {
      targets,
      lastPathname,
      currentPathname,
      totalLoaders,
    } = this.props

    targets.forEach((obj, i) => {
      const targetName = this.getTargetName(obj.name)

      this.cancellers[targetName] = addLoader({
        name: targetName,
        handler: this.handleLoad,
        method: obj.load,
        callback: () => {
          this.cancellers[targetName] = null
        },
      })

      if ((i + 1) === targets.length) {
        runLoaders(totalLoaders)
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

  getTargetName = name => {
    const { currentPathname } = this.props
    return `${currentPathname}_${name}`
  }

  hasTargetLoadedBefore = name => {
    const targetName = this.getTargetName(name)
    if (getLoadCount(targetName) <= 0) {
      return false
    }
    return true
  }

  getMasterName = () => {
    const {
      currentPathname,
      targets,
    } = this.props

    var masterName = `${currentPathname}`

    targets.forEach(obj => {
      masterName = `${masterName}_${obj.name}`
    })

    return masterName
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
        name: this.getTargetName(obj.name),
        method: obj.unload,
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
    const { targets } = this.props

    var total = 0
    targets.forEach(obj => {
      const targetName = this.getTargetName(obj.name)
      total += getLoadCount(targetName)
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

