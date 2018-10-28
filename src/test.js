import React from "react"
import DataController from "./index"

describe("<DataController/>", () => {
	const filledData = [{ name: "a" }, { name: "b" }]
	const emptyData = [{}, {}]
	const withDataDiv = <div>With Data</div>
	const withoutDataDiv = <div>Without Data</div>
	const renderWithoutData = () => {
		return withoutDataDiv
	}
	const renderWithData = () => {
		return withDataDiv
	}

	it("renders data with function", () => {
		const mockLoadData = jest.fn()
		const mockUnloadData = jest.fn()
		const wrapper = shallow(
			<DataController
				data={filledData}
				loadData={() => {
					mockLoadData()
				}}
				unloadData={() => {
					mockUnloadData()
				}}
				renderWithoutData={renderWithoutData}
				renderWithData={renderWithData}
			/>
		)

		expect(wrapper.contains(withDataDiv)).toBeTruthy()
		expect(mockLoadData.mock.calls.length).toBe(0)
		wrapper.unmount()
		expect(mockUnloadData.mock.calls.length).toBe(1)
	})

	it("renders data without function and with children", () => {
		const mockLoadData = jest.fn()
		const mockUnloadData = jest.fn()
		const wrapper = shallow(
			<DataController
				data={filledData}
				loadData={() => {
					mockLoadData()
				}}
				unloadData={() => {
					mockUnloadData()
				}}
				renderWithoutData={renderWithoutData}>
				{withDataDiv}
			</DataController>
		)

		expect(wrapper.contains(withDataDiv)).toBeTruthy()
		expect(mockLoadData.mock.calls.length).toBe(0)
		wrapper.unmount()
		expect(mockUnloadData.mock.calls.length).toBe(1)
	})

	it("renders without data with function", () => {
		const mockLoadData = jest.fn()
		const mockUnloadData = jest.fn()
		const wrapper = shallow(
			<DataController
				data={emptyData}
				loadData={() => {
					mockLoadData()
				}}
				unloadData={() => {
					mockUnloadData()
				}}
				renderWithoutData={renderWithoutData}
				renderWithData={renderWithData}
			/>
		)

		expect(wrapper.contains(withoutDataDiv)).toBeTruthy()
		expect(mockLoadData.mock.calls.length).toBe(1)
		wrapper.unmount()
		expect(mockUnloadData.mock.calls.length).toBe(1)
	})

	it("renders without data without function", () => {
		const mockLoadData = jest.fn()
		const mockUnloadData = jest.fn()
		const wrapper = shallow(
			<DataController
				data={emptyData}
				loadData={() => {
					mockLoadData()
				}}
				unloadData={() => {
					mockUnloadData()
				}}
				renderWithData={renderWithData}
			/>
		)

		expect(wrapper.equals(null)).toBe(true)
		expect(mockLoadData.mock.calls.length).toBe(1)
		wrapper.unmount()
		expect(mockUnloadData.mock.calls.length).toBe(1)
	})
})
