import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import { debounce } from "debounce"

import {
  isEmpty, setAttempted, getAttempted, incrementCount, decrementCount
} from "./utils"

/**
 * @description Controls what to render based on data being empty or not.
 * @param {Object|Array} data Checked for emptiness.
 * @param {Function} load Invoked to make the data non-empty.
 * @param {Function} unload Invoked to make the data empty.
 * @param {Function} renderWithout Invoked when rendering with empty data.
 * @param {Function} renderWith Invoked when rendering with non-empty data.
 * @param {String} name A name to use to count this data type.
 * @param {Number} maxLoads The number of times load can re-try before stopping.
 * @return {Component}
 * @example
 * import React from "react"
 * import PropTypes from "prop-types"
 * import { connect } from "react-redux"
 * import { RenderController } from "@alexseitsinger/react-render-controller"
 *
 * function App({ data, load, unload }){
 *   return (
 *     <RenderController
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
  }
  static defaultProps = {
    maxCount: 3,
  }
  constructor(props) {
    super(props)
    this.debouncedDoLoad = debounce(this.doLoad)
    this.debouncedDoUnload = debounce(this.doUnload)
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
    const { unload, name } = this.props
    if (_.isFunction(unload)) {
      const currentCount = name ? decrementCount(name) : 0
      if (currentCount === 0) {
        unload()
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
  componentDidMount() {
    this.debouncedDoLoad()
  }
  componentWillUnmount() {
    const { name } = this.props
    this.debouncedDoUnload(() => {
      setAttempted(name, false)
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

