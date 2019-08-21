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
 * @param {number} [props.loadDelay=300]
 * The number of milliseconds to wait before invoking the debounced load() and unload().
 * @param {number} [props.loadAttemptedDelay=1000]
 * The number of milliseconds to wait until setting the loadAttempted flag. Once
 * this flag is set, this component will use renderFailure() instead of
 * renderWithout() when there is empty data.
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
 *       loadDelay={500}
 *       loadAttemptedDelay={1000}
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
    loadAttemptedDelay: PropTypes.number,
    unload: PropTypes.func,
    renderWith: PropTypes.func,
    renderWithout: PropTypes.func,
    renderFailure: PropTypes.func,
    skipUnloadFor: PropTypes.arrayOf(PropTypes.string),
    currentPathname: PropTypes.string,
  }
  static defaultProps = {
    skipUnloadFor: [],
    loadDelay: 300,
    loadAttemptedDelay: 600,
  }

  constructor(props) {
    super(props)

    this.state = {
      loadAttempted: false,
    }

    this.debouncedLoad = debounce(this.handleLoad, props.loadDelay)
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
    const { load, loadAttemptedDelay } = this.props

    if(this.isLoaded() === false) {
      if(_.isFunction(load)) {
        load()

        setTimeout(() => {
          if (this.isMounted === true) {
            this.setState({loadAttempted: true})
          }
        }, loadAttemptedDelay)
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
    this.debouncedLoad()
  }
  componentDidMount() {
    this,isMounted = true
    this.debouncedLoad()
  }
  componentWillUnmount() {
    this.isMounted = false
    this.handleUnload()
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

