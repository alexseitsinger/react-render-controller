import React from "react"
import PropTypes from "prop-types"
import _ from "underscore"
import { isEmpty } from "./utils"

const count = {}

function incrementCount(name) {
	if (!(name in count)) {
		count[name] = 0
	}
	count[name] = ++count[name]
	return count[name]
}

function decrementCount(name) {
	if (!(name in count)) {
		count[name] = 0
	}
	// Decrement the count by 1
	count[name] = --count[name]
	count[name] = Math.max(0, count[name])
	return count[name]
}

class DataController extends React.Component {
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
		loadData: PropTypes.func,
		unloadData: PropTypes.func,
		renderWithoutData: PropTypes.func,
		renderWithData: PropTypes.func,
		name: PropTypes.string
	}
	componentWillUnmount() {
		const { unloadData, name } = this.props
		if (name) {
			const count = decrementCount(name)
			if (count === 0) {
				if (_.isFunction(unloadData)) {
					unloadData()
				}
			}
		} else {
			if (_.isFunction(unloadData)) {
				unloadData()
			}
		}
	}
	componentDidMount() {
		const { loadData, name } = this.props
		if (name) {
			const count = incrementCount(name)
		}
		const dataLoaded = this.dataLoaded()
		if (!dataLoaded) {
			if (_.isFunction(loadData)) {
				loadData()
			}
		}
	}
	dataLoaded = () => {
		const { data } = this.props
		const result = isEmpty(data)
		if (!result) {
			return true
		}
	}
	render() {
		const { children, renderWithoutData, renderWithData } = this.props
		const dataLoaded = this.dataLoaded()
		if (!dataLoaded) {
			if (_.isFunction(renderWithoutData)) {
				return renderWithoutData()
			} else {
				return null
			}
		} else {
			if (_.isFunction(renderWithData)) {
				return renderWithData()
			} else {
				return children
			}
		}
	}
}

export default DataController
