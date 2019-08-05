import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import { debounce } from "debounce"

import {
  isEmpty, setAttempted, getAttempted, incrementCount, decrementCount
} from "./utils"

/**
 * Controls what to render based on data being empty or not.
 *
 * @return {component}
 *
 * @param {object} props
 * @param {object|array} props.data
 * Checked for emptiness.
 * @param {function} [props.load]
 * Invoked to make the data non-empty.
 * @param {function} [props.unload]
 * Invoked to make the data empty.
 * @param {function} [props.renderWithout]
 * Invoked when rendering with empty data.
 * @param {function} [props.renderWith]
 * Invoked when rendering with non-empty data.
 * @param {function} [props.renderFailure] i
 * nvoked when loading was attempted but failed to produce non-empty data.
 * @param {array} [props.skipUnloadFor]
 * An array of pathnames to skip invoking unload for when navigating to them.
 * @param {string} [props.currentPathname]
 * The current pathname. Used to determine if skipUnloadFor test passes.
 * @param {number} [props.delay=1000]
 * The number of milliseconds to wait before invoking the debounced load() and unload().
 *
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
    renderWith: PropTypes.func,
    renderWithout: PropTypes.func,
    renderFailure: PropTypes.func,
    skipUnloadFor: PropTypes.arrayOf(PropTypes.string),
    currentPathname: PropTypes.string,
    delay: PropTypes.number,
  }
  static defaultProps = {
    skipUnloadFor: [],
    delay: 1000,
  }
  state = {
    loadAttempted: false,
  }

  constructor(props) {
    super(props)

    this.debouncedLoad = debounce(this.handleLoad, props.delay)
    this.debouncedUnload = debounce(this.handleUnload, props.delay)
  }
  isLoaded = () => {
    const { data } = this.props

    const result = isEmpty(data)
    if(result === true) {
      return false
    }

    return true
  }
  doLoad = (callback) => {
    const { load } = this.props

    if(_.isFunction(load)) {
      load()

      if (_.isFunction(callback)) {
        callback()
      }
    }
  }
  handleLoad = (callback) => {
    if(this.isLoaded() === false) {
      this.doLoad(() => {
        this.setState({loadAttempted: true}, () => {
          if(_.isFunction(callback)) {
            callback()
          }
        })
      })
    }
  }
  isSkipped = () => {
    // Skip unloading if the pathname matches a skipped pathname.
    const { skipUnloadFor, currentPathname } = this.props
    const hasSkipUnloadFor = (skipUnloadFor && skipUnloadFor.length)
    const hasCurrentPathname = (currentPathname && currentPathname.length)

    if(hasSkipUnloadFor && hasCurrentPathname) {
      if(skipUnloadFor.includes(currentPathname)) {
        return true
      }
    }

    return false
  }
  handleUnload = (callback) => {
    if(this.isLoaded() === true && this.isSkipped() === false) {
      this.doUnload(() => {
        this.setState({loadAttempted: false}, () => {
          if (_.isFunction(callback)) {
            callback()
          }
        })
      })
    }
  }
  doUnload = (callback) => {
    const { unload } = this.props

    if (_.isFunction(unload)) {
      unload()

      if (_.isFunction(callback)) {
        callback()
      }
    }
  }
  componentDidUpdate() {
    this.debouncedLoad()
  }
  componentDidMount() {
    this.debouncedLoad()
  }
  componentWillUnmount() {
    this.debouncedUnload()
  }
  render() {
    const { children, renderWithout, renderWith, renderFailure } = this.props
    const { loadAttempted } = this.state

    if (this.isLoaded() === true) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    if (loadAttempted === true && _.isFunction(renderFailure)) {
      return renderFailure()
    }

    if (_.isFunction(renderWithout)) {
      return renderWithout()
    }

    return null
  }
}
