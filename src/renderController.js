import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import { debounce } from "debounce"

import {
  isEmpty, setAttempted, getAttempted, incrementCount, decrementCount
} from "./utils"

/**
 * @description Controls what to render based on data being empty or not.
 * @param {object|array} data Checked for emptiness.
 * @param {function} [load] Invoked to make the data non-empty.
 * @param {function} [unload] Invoked to make the data empty.
 * @param {function} [renderWithout] Invoked when rendering with empty data.
 * @param {function} [renderWith] Invoked when rendering with non-empty data.
 * @param {string} [name] A name to use to count this data type.
 * @param {array} [skipUnloadFor] An array of pathnames to skip invoking unload
 * for when navigating to them.
 * @param {string} [currentPathname] The current pathname. Used to determine if
 * skipUnloadFor test passes.
 * @param {number} [maxCount=3] The max number of instances before skipping invoking
 * load.
 * @param {number} [delay=1000] The number of milliseconds to wait before invoking the
 * debounced load() and unload().
 * @return {component}
 * @example
 * import React from "react"
 * import PropTypes from "prop-types"
 * import { connect } from "react-redux"
 * import { RenderController } from "@alexseitsinger/react-render-controller"
 *
 * function App({ data, load, unload }){
 *   return (
 *     <RenderController
 *       name={"App_data"}
 *       data={data}
 *       load={load}
 *       unload={unload}
 *       renderWith={() => {
 *          return data.map((obj, i) => {
 *            const key = "data" + i.toString()
 *            return (
 *              <div key={key}>{obj.name}</div>
 *            )
 *          })
 *       }}
 *       renderWithout={() => <div>No data</div>}
 *     />
 *   )
 * }
 *
 * App.propTypes = {
 *   data: PropTypes.object.isRequired,
 *   load: PropTypes.func.isRequired,
 *   unload: PropTypes.func.isRequired
 * }
 *
 * const mapState = (state) => ({
 *   data: state.reducer.data
 * })
 *
 * const mapDispatch = (dispatch) => ({
 *   load: () => dispatch(getData()),
 *   unload: () => dispatch(setData({}))
 * })
 *
 * export default connect(mapState, mapDispatch)(App)
 */
export class RenderController extends PureComponent {
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
    renderWithout: PropTypes.func,
    renderWith: PropTypes.func,
    name: PropTypes.string,
    maxCount: PropTypes.number,
    skipUnloadFor: PropTypes.arrayOf(PropTypes.string),
    currentPathname: PropTypes.string,
    delay: PropTypes.number,
  }
  static defaultProps = {
    maxCount: 3,
    skipUnloadFor: [],
    delay: 1000,
  }
  constructor(props) {
    super(props)
    this.debouncedDoLoad = debounce(this.doLoad, props.delay)
    this.debouncedDoUnload = debounce(this.doUnload, props.delay)
  }
  isLoaded = () => {
    const { data } = this.props
    const result = isEmpty(data)
    if(result === true) {
      return false
    }
    return true
  }
  doLoad = (count, callback) => {
    const { load, name, maxCount } = this.props
    if(this.isLoaded() === false) {
      if(_.isFunction(load)) {
        if(count) {
          const currentCount = name ? incrementCount(name) : 0
          if (currentCount <= maxCount) {
            load()
            if (_.isFunction(callback)) {
              callback()
            }
          }
        }
        else {
          load()
          if (_.isFunction(callback)) {
            callback()
          }
        }
      }
    }
  }
  doUnload = (callback) => {
    const { unload, name, skipUnloadFor, currentPathname } = this.props
    // Otherwise, if we get an unload function, decrement the count, and unload
    // if it's at 0. Then, run our callback if we got one.
    if (_.isFunction(unload)) {
      const currentCount = name ? decrementCount(name) : 0
      if (currentCount === 0) {
        // Skip unloading if the pathname matches a skipped pathname.
        if (skipUnloadFor && skipUnloadFor.length && currentPathname && currentPathname.length) {
          if (!(skipUnloadFor.includes(currentPathname))) {
            unload()
          }
        }
        else {
          unload()
        }
        if (_.isFunction(callback)) {
          callback()
        }
      }
    }
  }
  componentDidUpdate() {
    const { name } = this.props
    if(getAttempted(name) === false) {
      this.debouncedDoLoad(false, () => {
        if(this.isLoaded() === false) {
          setAttempted(name, true)
        }
      })
    }
  }
  componentWillUnmount() {
    const { name } = this.props
    this.debouncedDoUnload(() => {
      setAttempted(name, false)
    })
  }
  componentDidMount() {
    const { name } = this.props
    this.debouncedDoLoad(true, () => {
      if (this.isLoaded() === false) {
        setAttempted(name, true)
      }
    })
  }
  render() {
    const { children, renderWithout, renderWith } = this.props
    if (this.isLoaded() === true) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }
    else {
      if (_.isFunction(renderWithout)) {
        return renderWithout()
      }
      return null
    }
  }
}

