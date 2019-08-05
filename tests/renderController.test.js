import React from "react"
import { RenderController } from "../src"

const arrayData = [{ name: "a" }, { name: "b" }]
const objectData = { name: "a" }
const emptyObjectData = {}
const emptyArrayData = []
const nullData = null
const RenderWith = () => <div>Render With</div>
const RenderWithout = () => <div>Render Without</div>
const RenderFailure = () => <div>Render Failure</div>

// TODO: Add test case for re-renders after mount/unmount -> Make sure it
// doesn't cause an infinite loop (That;s why we use the "name" prop to count)

describe("<RenderController/>", () => {
  it("renders using renderFailure when load fails to produce non-empty data", () => {
    const delay = 300
    const wrapper = mount(
      <RenderController
        delay={delay}
        data={null}
        load={() => {
          console.log("load attempted")
        }}
        unload={() => {
          console.log("unload attempted")
        }}
        renderWith={() => {
          return <RenderWith />
        }}
        renderWithout={() => {
          return <RenderWithout />
        }}
        renderFailure={() => {
          return <RenderFailure />
        }}
      />
    )
    // The controller should first use renderWithout() before the loading has
    // started.
    expect(wrapper.find(RenderWithout)).toHaveLength(1)

    setTimeout(() => {
      // Once load has been attempted, it should use renderFailure()
      expect(wrapper.find(RenderWithout)).toHaveLength(0)
      expect(wrapper.find(RenderWith)).toHaveLength(0)
      expect(wrapper.find(RenderFailure)).toHaveLength(1)
    }, delay)
  })
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
