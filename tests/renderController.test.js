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
const WithData = () => <div className={"withData"}>With Data</div>
const WithoutData = () => <div className={"withoutData"}>Without Data</div>


const loadDelay = 2500

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
  it("invokes renderWith with object data", () => {
    const wrapper = mount(
      <RenderController
        targets={[
          {
            name: "dataOne",
            data: objectData,
            load: () => {},
            unload: () => {},
          },
        ]}
        currentPathname={"/"}
        lastPathname={"/"}
        renderWith={() => <WithData />}
      />
    )

    setTimeout(() => {
      expect(wrapper.find(".withData")).toHaveLength(1)
      expect(wrapper.find(".withData").text()).toBe("With Data")
    }, loadDelay)
  })

  it("renders children with data", () => {
    const wrapper = mount(
      <RenderController
        targets={[
          {
            name: "dataOne",
            data: objectData,
            load: () => {},
            unload: () => {},
          },
        ]}
        currentPathname={"/"}
        lastPathname={"/"}
        renderWith={() => <WithData />}>
        <WithData />
      </RenderController>
    )

    setTimeout(() => {
      expect(wrapper.find(".withData")).toHaveLength(1)
      expect(wrapper.find(".withData").text()).toBe("With Data")
    }, loadDelay)
  })

  it("invokes renderWithout with empty object.", () => {
    const wrapper = mount(
      <RenderController
        targets={[
          {
            name: "dataOne",
            data: emptyObjectData,
            load: () => {},
            unload: () => {},
          },
        ]}
        currentPathname={"/"}
        lastPathname={"/"}
        renderWithout={() => (<WithoutData />)}
      />
    )

    setTimeout(() => {
      expect(wrapper.find(".withoutData")).toHaveLength(1)
      expect(wrapper.find(".withoutData").text()).toBe("Without Data")
    }, loadDelay)
  })
})
