import React from "react"

import { RenderController } from "../src"

import { setupTestOne } from "./testOne"
import {
  FailedRender,
  SuccessfulRender,
  FirstRender,
} from "./components"

export const failDelay = 6000

// TODO: Add test case for re-renders after mount/unmount -> Make sure it
// doesn't cause an infinite loop (That;s why we use the "name" prop to count)
//
// TODO: Add test for:
//       1) multiple instances loading the same data name.
//          a) should only invoke load once after a delay.
//       2) ensure load only happens once, then resets after 10 seconds of idle.
//       3) if using shouldUpdate(), check the last action (load or unload)
//          to determine if shouldUpdate should run or just passthrough (unload)

describe("<RenderController />", () => {
  it("loads data only after a 3300 ms delay.", () => {
    const wrapper = mount(setupTestOne())

    expect(wrapper.find(FirstRender)).toHaveLength(3)

    setTimeout(() => {
      expect(wrapper.find(SuccessfulRender)).toHaveLength(3)
    }, 6000)

    setTimeout(() => {
      expect(wrapper.find(FailedRender)).toHaveLength(0)
    }, failDelay)
  })
})
