import React from "react"
import { RenderController } from "../src"

const arrayData = [{ name: "a" }, { name: "b" }]
const objectData = { name: "a" }
const emptyObjectData = {}
const emptyArrayData = []
const nullData = null

// TODO: Add test case for re-renders after mount/unmount -> Make sure it
// doesn't cause an infinite loop (That;s why we use the "name" prop to count)

describe("<RenderController/>", () => {
  it("invokes renderWith with array data", () => {
    const wrapper = mount(
      <RenderController
        data={arrayData}
        renderWith={() => {
          return <div className={"withData"}>With Data</div>
        }}
      />
    )
    expect(wrapper.find(".withData")).toHaveLength(1)
    expect(wrapper.find(".withData").text()).toBe("With Data")
  })

  it("invokes renderWith with object data", () => {
    const wrapper = mount(
      <RenderController
        data={objectData}
        renderWith={() => {
          return <div className={"withData"}>With Data</div>
        }}
      />
    )
    expect(wrapper.find(".withData")).toHaveLength(1)
    expect(wrapper.find(".withData").text()).toBe("With Data")
  })

  it("renders children with data", () => {
    const wrapper = mount(
      <RenderController data={objectData}>
        <div className={"withData"}>With Data</div>
      </RenderController>
    )
    expect(wrapper.find(".withData")).toHaveLength(1)
    expect(wrapper.find(".withData").text()).toBe("With Data")
  })

  it("invokes renderWithout with empty array data", () => {
    const wrapper = mount(
      <RenderController
        data={emptyArrayData}
        renderWithout={() => {
          return <div className={"withoutData"}>Without Data</div>
        }}
      />
    )
    expect(wrapper.find(".withoutData")).toHaveLength(1)
    expect(wrapper.find(".withoutData").text()).toBe("Without Data")
  })

  it("invokes renderWithout with empty object data", () => {
    const wrapper = mount(
      <RenderController
        data={emptyObjectData}
        renderWithout={() => {
          return <div className={"withoutData"}>Without Data</div>
        }}
      />
    )
    expect(wrapper.find(".withoutData")).toHaveLength(1)
    expect(wrapper.find(".withoutData").text()).toBe("Without Data")
  })

  it("invokes renderWithout with null data", () => {
    const wrapper = mount(
      <RenderController
        data={nullData}
        renderWithout={() => {
          return <div className={"withoutData"}>Without Data</div>
        }}
      />
    )
    expect(wrapper.find(".withoutData")).toHaveLength(1)
    expect(wrapper.find(".withoutData").text()).toBe("Without Data")
  })

  it("renders nothing with null data, and no renderWithout method", () => {
    const wrapper = mount(<RenderController data={nullData} />)
    expect(wrapper.children()).toHaveLength(0)
  })

  it("renders nothing with no props", () => {
    const wrapper = mount(<RenderController />)
    expect(wrapper.children()).toHaveLength(0)
  })
})
