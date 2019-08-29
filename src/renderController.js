import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import debounce from "debounce"

import {
  isEmpty, removeLeadingAndTrailingSlashes,
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
    lastPathname: PropTypes.string,
    nextPathname: PropTypes.string,
    skippedPathnames: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    skippedPathnames: [],
  }

  constructor(props) {
    super(props)
    this.handleLoad = debounce(this.handleLoad, 700)
    this.handleLoad()
  }

  isDataEmpty = () => {
    const { data } = this.props
    return (isEmpty(data) === true)
  }

  handleLoad = () => {
    const { load } = this.props

    if(_.isFunction(load)) {
      if (this.isDataEmpty() === true) {
        load()
      }
    }
  }

  handleUnload = () => {
    const { unload } = this.props

    if (_.isFunction(unload)) {
      if (this.isSkippedPathname() === false) {
        unload()
      }
    }
  }

  isSkippedPathname = () => {
    const { skippedPathnames, nextPathname, lastPathname } = this.props
    // If we dont get any pathnames, then assume its not skipped.
    if ((!(nextPathname)) || (!(lastPathname))) {
      return false
    }
    // Remove leading/trailing slashes to preserve correct order in array.
    const nextPathnameStripped = removeLeadingAndTrailingSlashes(nextPathname)
    const lastPathnameStripped = removeLeadingAndTrailingSlashes(lastPathname)
    // If the pathnames are the same, then assume it's skipped.
    if (nextPathnameStripped === lastPathnameStripped) {
      return true
    }
    // If we dont get any pathnames to skip, then assume its not skipped.
    if (!(skippedPathnames.length)) {
      return false
    }
    // Check that the nextPathanem matches one of the skippedPathnames.
    const isTrue = result => (result === true)
    const nextPathnameBits = nextPathnameStripped.split("/")
    return skippedPathnames.map(skippedPathname => {
      const skippedPathnameStripped = removeLeadingAndTrailingSlashes(skippedPathname)
      if (nextPathnameStripped === skippedPathnameStripped) {
        return true
      }
      return skippedPathnameStripped.split("/").map((skippedPathnameBit, i) => {
        const isWildcard = Boolean(
          skippedPathnameBit === "*"
          && nextPathnameBits.length
          && nextPathnameBits[i]
          && nextPathnameBits[i].length
        )
        const isMatching = Boolean(
          nextPathnameBits.length
          && nextPathnameBits[i]
          && nextPathnameBits[i] === skippedPathnameBit
        )
        return ((isMatching === true) || (isWildcard === true))
      }).every(isTrue)
    }).includes(true)
  }

  componentDidUpdate() {
    this.handleLoad()
  }

  componentWillUnmount() {
    this.handleUnload()
  }

  render() {
    const { children, renderWithout, renderWith, renderFailure } = this.props

    if (this.isDataEmpty() === false) {
      if (_.isFunction(renderWith)) {
        return renderWith()
      }
      return children
    }

    if (_.isFunction(renderWithout)) {
      return renderWithout()
    }

    return null
  }
}

