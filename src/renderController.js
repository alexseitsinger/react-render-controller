import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import debounce from "debounce"

import {
  isEmpty,
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
    loadDelay: 1100,
  }

  constructor(props) {
    super(props)

    this.debouncedHandleLoad = debounce(this.handleLoad, 600)
    this.debouncedHandleUnload = debounce(this.handleUnload, 600)

    // Set a flag to signify that this instance is mounted or not. Used to
    // determine if setState should actually run or not.
    this._isComponentMounted = false

    // Save a copy of the original setState with our context bound to it.
    // Overwrite the instance's setState to only run when '_isComponentMounted'
    // is true.
    let realSetState = this.setState.bind(this)
    this.setState = (...args) => {
      if (this._isComponentMounted === false) {
        return
      }
      realSetState(...args)
    }

    this._loadsAttempted = 0
  }

  state = {
    // When the 'load' method is attempted, set this flag to True. When this
    // is true, the 'renderFailure' method will be invoked to render the
    // component when the data remains empty, instead of the 'renderWithout'
    // method.
    isLoadAttempted: false,
  }

  isFirstLoadAttempt = () => {
    return Boolean(this._loadsAttempted === 1)
  }

  setLoadAttempted = bool => {
    this.setState(prevState => {
      if (bool === true) {
        this._loadsAttempted += 1
      }
      return {
        ...prevState,
        isLoadAttempted: bool,
      }
    })
  }


  // Check if the provided 'currentPathname' is listed in the 'skipUnloadFor'
  // prop. If it exists, return true to prevent 'unload' from make the data
  // empty. Otherwise, return false to allow 'unload' to make the 'data' prop
  // empty.
  isUnloadSkipped = () => {
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

  // Returns true/false if the 'data' prop is empty or not.
  isLoaded = () => {
    const { data } = this.props
    if (isEmpty(data) === true) {
      return false
    }
    return true
  }

  // If the data is empty, and a 'load' method was provied, invoke it to attempt
  // to make the 'data' non-empty. Then, after a delay, set the
  // 'isLoadAttempted' flag to true. After this, if the data is still empty, and
  // a 'renderFailure' method was provided, this method will be used to render
  // the components output instead of 'renderWithout'.
  handleLoad = () => {
    const { load, loadDelay } = this.props
    if(this.isLoaded() === false) {
      if(_.isFunction(load)) {
        load()

        setTimeout(() => {
          this.setLoadAttempted(true)
        }, loadDelay)
      }
    }
  }

  // If 'currentPathanme' was provided, it's not one of the listed pathnames
  // to be skipped, an 'unload' mehthod was provided, and we didn't just perform
  // our first load attempt, then invoke the 'unload' method to make the data
  // empty.
  handleUnload = () => {
    const { unload } = this.props
    const { isLoadAttempted } = this.state

    if(this.isUnloadSkipped() === false) {
      if (_.isFunction(unload)) {
        // When we set the isLoadAttempted flag, the component gets unmounted,
        // and then remounted, causing the data to unload. So, check for this
        // state change before running unload. Only run unload when its not the
        // first load attempt.
        if (isLoadAttempted === true) {
          if (this.isFirstLoadAttempt() === false) {
            unload()
          }
        }
      }
    }
  }

  componentDidUpdate() {
    // Changing the component in development causes unload to be invoked. As
    // such, without a call to 'handleLoad' from cdu, the data stays empty. So,
    // in order to prevent this, we need to call 'handleLoad' again each time
    // the component is updated. Since, 'handleLoad' checks for emptiness before
    // actually attempting to replace the data, we don't need to worry about
    // duplicate/redundant calls from here.
    this.debouncedHandleLoad()
  }

  componentDidMount() {
    // Each time the component is mounted, set this flag. This is used to
    // determine if the setState should actually run or not. We need this
    // because we attempt to run setState after a timeout in 'handleLoad'. If we
    // don't do this, we may cause a memory leak each time load is attempted.
    this._isComponentMounted = true
    this.debouncedHandleLoad()
  }

  componentWillUnmount() {
    // Set a flag when the component will be unmounted. Same as about, this is
    // to prevent a memory leak when invoking 'handleLoad'.
    this._isComponentMounted = false
    this.debouncedHandleUnload()
  }

  render() {
    const { children, renderWithout, renderWith, renderFailure } = this.props
    const { isLoadAttempted } = this.state

    // If the data is non-empty, return the output of 'renderWith'. Otherwise,
    // return the output from 'children'.
    if (this.isLoaded() === true) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    // If the data is empty, a load was attempted, and a 'renderFailure' method
    // was passed, return the output of 'renderFailure'.
    if (isLoadAttempted === true && _.isFunction(renderFailure)) {
      return renderFailure()
    }

    // If the data is empty, but no load was attempted, and the 'renderWithout'
    // method was provided, return the output of 'renderWithout'.
    if (_.isFunction(renderWithout)) {
      return renderWithout()
    }

    // Otherwise, return nothing.
    return null
  }
}

