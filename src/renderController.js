import React from "react"
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
 * @param {number} [props.loadDelay=900]
 * The number of seconds before the isLoadAttempted flag is set to True. When
 * this flag is True, the renderFailure() will be invoked to return output
 * instead of renderWithout, if there is empty data.
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
 *       loadDelay={900}
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
    loadDelay: PropTypes.number,
    unload: PropTypes.func,
    renderWith: PropTypes.func,
    renderWithout: PropTypes.func,
    renderFailure: PropTypes.func,
    skipUnloadFor: PropTypes.arrayOf(PropTypes.string),
    currentPathname: PropTypes.string,
  }

  static defaultProps = {
    skipUnloadFor: [],
    loadDelay: 900,
  }

  constructor(props) {
    super(props)

    this.state = {
      isLoadAttempted: false,
    }

    // Set a flag to determine if this instnace is mounted or not.
    // This will help prevent memory leaks from debounced load calls.
    this._isMounted = false

    // Save a copy of the original setState with our context bound to it.
    // Overwrite the instance's setState to only invoke when _isMounted is true.
    let realSetState = this.setState.bind(this)
    this.setState = (...args) => {
      if (this._isMounted === false) {
        return
      }
      realSetState(...args)
    }
  }

  isLoaded = () => {
    const { data } = this.props

    const result = isEmpty(data)
    if(result === true) {
      return false
    }

    return true
  }

  handleLoad = () => {
    const { load, loadDelay } = this.props
    if(this.isLoaded() === false) {
      if(_.isFunction(load)) {
        load()

        setTimeout(() => {
          this.setState({isLoadAttempted: true})
        }, loadDelay)
      }
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

  handleUnload = () => {
    const { unload } = this.props
    // We don't want to use anything with state here, otherwise we'll cause a
    // memory leak, since this method is debounced when its invoked.
    if(this.isSkipped() === false) {
      if (_.isFunction(unload)) {
        unload()
      }
    }
  }

  componentDidUpdate() {
    //this.handleLoad()
  }

  componentDidMount() {
    this._isMounted = true
    this.handleLoad()
  }

  componentWillUnmount() {
    this._isMounted = false
    this.handleUnload()
  }

  render() {
    const { children, renderWithout, renderWith, renderFailure } = this.props
    const { isLoadAttempted } = this.state

    if (this.isLoaded() === true) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    if (isLoadAttempted === true && _.isFunction(renderFailure)) {
      return renderFailure()
    }

    if (_.isFunction(renderWithout)) {
      return renderWithout()
    }

    return null
  }
}

