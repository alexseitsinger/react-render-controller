import React from "react"
import DataController from "./index"

const arrayData = [{ name: "a" }, { name: "b" }]
const objectData = { name: "a" }
const emptyObjectData = {}
const emptyArrayData = []
const nullData = null

describe("<DataController/>", () => {
	it("invokes renderWithData with array data", () => {
		const wrapper = mount(
			<DataController
				data={arrayData}
				renderWithData={() => {
					return <div className={"withData"}>With Data</div>
				}}
			/>
		)
		expect(wrapper.find(".withData")).toHaveLength(1)
		expect(wrapper.find(".withData").text()).toBe("With Data")
	})

	it("invokes renderWithData with object data", () => {
		const wrapper = mount(
			<DataController
				data={objectData}
				renderWithData={() => {
					return <div className={"withData"}>With Data</div>
				}}
			/>
		)
		expect(wrapper.find(".withData")).toHaveLength(1)
		expect(wrapper.find(".withData").text()).toBe("With Data")
	})

	it("renders children with data", () => {
		const wrapper = mount(
			<DataController data={objectData}>
				<div className={"withData"}>With Data</div>
			</DataController>
		)
		expect(wrapper.find(".withData")).toHaveLength(1)
		expect(wrapper.find(".withData").text()).toBe("With Data")
	})

	it("invokes renderWithoutData with empty array data", () => {
		const wrapper = mount(
			<DataController
				data={emptyArrayData}
				renderWithoutData={() => {
					return <div className={"withoutData"}>Without Data</div>
				}}
			/>
		)
		expect(wrapper.find(".withoutData")).toHaveLength(1)
		expect(wrapper.find(".withoutData").text()).toBe("Without Data")
	})

	it("invokes renderWithoutData with empty object data", () => {
		const wrapper = mount(
			<DataController
				data={emptyObjectData}
				renderWithoutData={() => {
					return <div className={"withoutData"}>Without Data</div>
				}}
			/>
		)
		expect(wrapper.find(".withoutData")).toHaveLength(1)
		expect(wrapper.find(".withoutData").text()).toBe("Without Data")
	})

	it("invokes renderWithoutData with null data", () => {
		const wrapper = mount(
			<DataController
				data={nullData}
				renderWithoutData={() => {
					return <div className={"withoutData"}>Without Data</div>
				}}
			/>
		)
		expect(wrapper.find(".withoutData")).toHaveLength(1)
		expect(wrapper.find(".withoutData").text()).toBe("Without Data")
	})

	it("renders nothing with null data, and no renderWithoutData method", () => {
		const wrapper = mount(<DataController data={nullData} />)
		expect(wrapper.children()).toHaveLength(0)
	})

	it("renders nothing with no props", () => {
		const wrapper = mount(<DataController />)
		expect(wrapper.children()).toHaveLength(0)
	})
})
