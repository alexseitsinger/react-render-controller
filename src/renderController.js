import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"

import {
  resetLoadCount,
  updateLoadCount,
  getLoadCount,
  createShouldUpdate,
  isEmpty,
  removeLeadingAndTrailingSlashes,
  runUnloaders,
  addUnloader,
  createShouldSkipUnload,
  addLoader,
  runLoaders,
} from "./utils"

/**
 * Controls what to render based on data being empty or not.
 *
 * @return {function}
 *
 * @param {object} props
 * @param {object|array} props.data
 * Checked for emptiness.
 * @param {function} [props.load]
 * Invoked to make the data non-empty.
 * @param {function} [props.unload]
 * Invoked to make the data empty.
 * @param {function} [props.renderWith]
 * Invoked when rendering with non-empty data.
 * @param {function} [props.renderWithout]
 * Invoked when rendering with empty data.
 * @param {string} [props.lastPathname]
 * The pathname of the last page navigated to
 * @param {string} [props.currentPathname]
 * The pathname of the current page navigated to.
 * @param {array} [props.skippedPathnames]
 * The pathnames to skip unloading for when this component is navigated away
 * from.
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
      PropTypes.node
    ]),
    data: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.object,
      PropTypes.array
    ]),
    load: PropTypes.func,
    unload: PropTypes.func,
    renderFirst: PropTypes.func,
    renderWith: PropTypes.func,
    renderWithout: PropTypes.func,
    lastPathname: PropTypes.string,
    currentPathname: PropTypes.string,
    skippedPathnames: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    skippedPathnames: [],
  }

  constructor(props) {
    super(props)

    this.dataName = null
    this.cancelLoad = null

    this.processUnloaders()
    this.processLoaders()
  }

  componentDidUpdate(prevProps, prevState) {
    if (_.isEqual(this.props.data, prevProps.data) === false) {
      if (_.isFunction(this.cancelLoad)) {
        this.cancelLoad()
      }
    }
  }

  handleLoad = (force) => {
    const { load }  = this.props

    if (_.isFunction(load)) {
      if (this.isDataEmpty() === true) {
        if (getLoadCount(this.getDataName()) <= 0) {
          load()
        }
      }
    }
  }

  processLoaders = () => {
    const { load, lastPathname, currentPathname } = this.props

    if (!( lastPathname, currentPathname )) {
      return
    }

    this.cancelLoad = addLoader(this.getDataName(), this.handleLoad, () => {
      this.cancelLoad = null
    })

    runLoaders(lastPathname, currentPathname)
  }

  handleUnload = () => {
    const { unload } = this.props

    if (_.isFunction(unload)) {
      unload()
      resetLoadCount(this.getDataName())
    }
  }

  processUnloaders = () => {
    const {
      lastPathname,
      currentPathname,
      skippedPathnames,
      unload,
    } = this.props

    if (!(lastPathname && currentPathname)) {
      return
    }
    runUnloaders(lastPathname, currentPathname)

    if (_.isFunction(unload) === false) {
      return
    }
    addUnloader(lastPathname, currentPathname, skippedPathnames, this.handleUnload, this.getDataName())
  }

  getDataName = () => {
    const {
      currentPathname,
      data,
    } = this.props

    const prefix = currentPathname
    var suffix

    var dataName = this.dataName
    if (!(dataName)) {
      if (_.isObject(data)) {
        const keys = Object.keys(data)
        if (keys.length) {
          suffix = keys.join("_")
        }
        else {
          suffix = _.uniqueId()
        }
      }
      else {
        suffix = `data_${_.uniqueId()}`
      }

      this.dataName = dataName = `${prefix}_${suffix}`
    }

    return dataName
  }

  isDataEmpty = () => {
    const { data } = this.props
    if (!(data)) {
      return true
    }

    const keys = Object.keys(data)
    if (!(keys.length) || (keys.length > 1)) {
      throw new Error("Data must be a named object.")
    }

    const actualData = data[keys[0]]
    if (!actualData) {
      throw new Error("Data must be a named object.")
    }

    const actualDataKeys = Object.keys(actualData)
    if (!(actualDataKeys.length)) {
      return true
    }

    return isEmpty(actualData) === true
  }

  render() {
    const { children, renderWithout, renderWith, renderFirst } = this.props

    if (this.isDataEmpty() === true) {
      if (getLoadCount(this.getDataName()) <= 0) {
        if (_.isFunction(renderFirst)) {
          return renderFirst()
        }
      }

      if (_.isFunction(renderWithout)) {
        return renderWithout()
      }

      return null
    }

    if (_.isFunction(renderWith)) {
      return renderWith()
    }

    return children
  }
}

