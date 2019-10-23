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
 * Controls what to render based on data being empty or not.
 *
 * @param {object} props
 * @param {object|array} props.data
 * @param {function} [props.load]
 * @param {function} [props.unload]
 * @param {function} [props.renderWith]
 * @param {function} [props.renderWithout]
 * @param {string} [props.lastPathname]
 * @param {string} [props.currentPathname]
 * @param {array} [props.skippedPathnames]
 *
 * @example
 * // reducer.js
 * import { combineReducers } from "react-redux"
 * import { locationsReducer } from "@alexseitsinger/redux-locations"
 *
 * import { pageOneReducer } from "pages/page-one/reducer"
 *
 * export const createRootReducer = () => combineReducers({
 *   locations: locationsReducer,
 *   pages: combineReducers({
 *     ...
 *     pageOne: pageOneReducer,
 *     ...
 *   }),
 * })
 *
 * // store.js
 * import {
 *   createStore as createReduxStore,
 *   applyMiddleware,
 *   compose,
 * } from "redux"
 * import { createLocationsMiddleware } from "@alexseitsinger/redux-locations"
 *
 * import { createRootReducer } from "reducer"
 *
 * const locationsMiddleware = createLocationsMiddleware()
 *
 * export const createStore = (..., initialState, ...) => {
 *   const rootReducer = createRootReducer()
 *   const middleware = [
 *     ...
 *     locationsMiddleware,
 *     ...
 *   ]
 *   const storeEnhancers = compose(applyMiddleware(...middleware))
 *   const store = createReduxStore(rootReducer, initialState, storeEnhancers)
 *   return store
 * }
 *
 * // pages/page-one/index.js
 * import React from "react"
 * import { connect } from "react-redux"
 * import { RenderController } from "@alexseitsinger/react-render-controller"
 *
 * import { getPageData, setPageData } from "actions/page-one.js"
 *
 * function PageOne({
 *   states: {
 *     pageOne: {
 *       data,
 *     },
 *     locations: {
 *       last,
 *       current,
 *     },
 *   },
 *   methods: {
 *     pageOne: {
 *       loadData,
 *       unloadData,
 *     },
 *   },
 * }){
 *   return (
 *     <RenderController
 *       data={data}
 *       load={loadData}
 *       unload={unloadData}
 *       lastPathname={last.pathname}
 *       currentPathname={current.pathname}
 *       skippedPathnames={[
 *         "/path/to/page"
 *       ]}
 *       renderWith={() => {
 *          // This is rendered when the 'data' object/array is non-empty.
 *          return data.map((obj, i) => {
 *            const key = "data" + i.toString()
 *            return (
 *              <div key={key}>{obj.name}</div>
 *            )
 *          })
 *       }}
 *       renderWithout={() => {
 *         // This is rendered when the data object/array is empty.
 *         return (
 *           <div>No data</div>
 *         )
 *       }}
 *     />
 *   )
 * }
 *
 * const mapState = state => ({
 *   states: {
 *     locations: state.locations,
 *     pageOne: state.pages.pageOne,
 *   },
 * })
 *
 * const mapDispatch = dispatch => ({
 *   methods: {
 *     pageOne: {
 *       loadData: () => dispatch(getPageData()),
 *       unloadData: () => dispatch(setPageData({})),
 *     },
 *   },
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
  }

  static defaultProps = {
    children: null,
    skippedPathnames: [],
    renderFirst: null,
    renderWith: null,
    renderWithout: null,
    failDelay: 6000,
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

    // Start the process off before the component gets mounted so data is
    // updated as early as possible,
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

  processLoaders = () => {
    const {
      targets,
      lastPathname,
      currentPathname,
    } = this.props

    targets.forEach(obj => {
      const targetName = this.getTargetName(obj.name)
      this.cancellers[targetName] = addLoader(targetName, this.handleLoad, () => {
        this.cancellers[targetName] = null
      })
    })

    runLoaders(lastPathname, currentPathname)
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

  processUnloaders = () => {
    const {
      targets,
      lastPathname,
      currentPathname,
      skippedPathnames,
    } = this.props

    runUnloaders(lastPathname, currentPathname)

    targets.forEach(obj => {
      const targetName = this.getTargetName(obj.name)
      addUnloader(lastPathname, currentPathname, skippedPathnames, this.handleUnload, targetName)
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
    const { isLoadAttempted } = this.state

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

