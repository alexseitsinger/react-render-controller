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

const loadDelay = 3000

// TODO: Add test case for re-renders after mount/unmount -> Make sure it
// doesn't cause an infinite loop (That;s why we use the "name" prop to count)
//
// TODO: Add test for:
//       1) multiple instances loading the same data name.
//          a) should only invoke load once after a delay.
//       2) ensure load only happens once, then resets after 10 seconds of idle.
//       3) if using shouldUpdate(), check the last action (load or unload)
//          to determine if shouldUpdate should run or just passthrough (unload)

describe("<RenderController/>", () => {
  it("renders using renderFailure when load fails to produce non-empty data", () => {

    const wrapper = mount(
      <RenderController
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
    }, loadDelay)
  })

    /**
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
  */

  it("invokes renderWith with object data", () => {
    const wrapper = mount(
      <RenderController
        data={{
          data: objectData,
        }}
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
      <RenderController
        data={{
          data: objectData
        }}>
        <div className={"withData"}>With Data</div>
      </RenderController>
    )
    expect(wrapper.find(".withData")).toHaveLength(1)
    expect(wrapper.find(".withData").text()).toBe("With Data")
  })

    /**
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
  */

  it("invokes renderWithout with empty named object.", () => {
    const wrapper = mount(
      <RenderController
        data={{
          data: emptyObjectData,
        }}
        renderWithout={() => {
          return <div className={"withoutData"}>Without Data</div>
        }}
      />
    )
    expect(wrapper.find(".withoutData")).toHaveLength(1)
    expect(wrapper.find(".withoutData").text()).toBe("Without Data")
  })

    /**
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
  */

    /*
  it("renders nothing with null data, and no renderWithout method", () => {
    const wrapper = mount(<RenderController data={nullData} />)
    expect(wrapper.children()).toHaveLength(0)
  })
  */

    /*
  it("renders nothing with no props", () => {
    const wrapper = mount(<RenderController />)
    expect(wrapper.children()).toHaveLength(0)
  })
  */
})
