import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import { isEmpty, incrementCount, decrementCount } from "./utils"

/**
 * @description Controls what to render based on data being empty or not.
 * @param {Object|Array} data Checked for emptiness.
 * @param {Function} load Invoked to make the data non-empty.
 * @param {Function} unload Invoked to make the data empty.
 * @param {Function} renderWithout Invoked when rendering with empty data.
 * @param {Function} renderWith Invoked when rendering with non-empty data.
 * @param {String} name A name to use to count this data type.
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
		name: PropTypes.string
	}
	componentWillUnmount() {
    const { unload, name } = this.props
    if(_.isFunction(unload)){
      if(name) {
        if(decrementCount(name) === 0){
          unload()
        }
      } 
      else {
        unload()
      }
    }
	}
	componentDidMount() {
		const { load, name } = this.props
		if (name) {
			incrementCount(name)
		}
    if(this.isLoaded() === true){
      return
    }
    if(_.isFunction(load)){
      load()
    }
	}
	isLoaded = () => {
		const { data } = this.props
    if(isEmpty(data) === true){
      return false
    }
    return true
	}
	render() {
		const { children, renderWithout, renderWith } = this.props
    if(this.isLoaded() === true){
      if(_.isFunction(renderWith)){
        return renderWith()
      }
      return children
    }
    else {
      if(_.isFunction(renderWithout)){
        return renderWithout()
      }
      return null
    }
	}
}

