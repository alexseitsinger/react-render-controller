# Data Controller

## Description

A render controller for components that use data.

## Props

-   children - (Node, Array of Nodes / Optional ) - The children to render when the data is present.
-   data - ( Object, Array of Objects / Optional ) - The data to check is not empty before rendering.
-   loadData - (Function / Optional) - The function to invoke, when the component is mounted, to load the data if it's empty.
-   unloadData - (Function / Optional ) - The function to invoke, when the component is unmounted, to unload the data if it's not empty.
-   renderWithoutData - (Function / Optional) - The function to invoke, to render the component, when the data is empty. If not provided, will render null.
-   renderWithData - (Function / Optional) - The function to invoke, to render the component, when the data is not empty. If not provided, will render children.
-   name - (String / Optional) - Each time an instance of this component is mounted, a counter will be incremented under this name. When the component is unmounted, if the count is 0, it will invoke unloadData. Otherwise, the data will remain. If no name is provided, an unloadData is provided, it will invoke it every time.

## Usage

```javascript
import React from "react"
import PropTypes from "prop-types"
import {
	loadFirstData,
	loadSecondData,
	unloadFirstData,
	unloadSecondData
} from "../actions/example"

class ExampleApp extends React.Component {
	static propTypes = {
		firstData: PropTypes.object,
		secondData: PropTypes.object
	}
	render() {
		const { firstData, secondData } = this.props
		return (
			<DataController
				name={"example"}
				data={[firstData, secondData]}
				loadData={() => {
					dispatch(loadFirstData())
					dispatch(loadSecondData())
				}}
				unloadData={() => {
					dispatch(unloadFirstData())
					dispatch(unloadSecondData())
				}}
				renderWithoutData={() => {
					return <div>No Data</div>
				}}
				renderWithData={() => {
					const itemOne = firstData.item
					const itemTwo = secondData.item
					return (
						<div>
							<div>{itemOne}</div>
							<div>{itemTwo}</div>
						</div>
					)
				}}
			/>
		)
	}
}

export default ExampleApp
```
