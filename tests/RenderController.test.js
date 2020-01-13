import React from "react"
import waitForExpect from "wait-for-expect"

import mapDispatch from "tests/integration/setup/app/pages/c/mapDispatch"
//import { RenderController } from "src"
import setup from "tests/integration/setup"
import {
  FirstRender,
  SuccessfulRender,
  FailedRender,
} from "tests/integration/setup/components"

// test:
// 1) data is unloaded on when navigated away, then data is re-loaded when
// navigated back.
// 2) doesnt use cached data if the cached is empty.

describe("RenderController", () => {
  it("should load data, then after success, use renderWith", async () => {
    const { wrapper, store, history } = setup()

    // FirstRender wont show because the mounting process is too fast.
    //expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should attempt to load data, then after failure, use renderWithout", async () => {
    const { wrapper, store, history } = setup("/page-b")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should unload first then load data for each target", async () => {
    const getOneDataMock = jest.fn()
    const setOneDataMock = jest.fn()
    const getTwoDataMock = jest.fn()
    const setTwoDataMock = jest.fn()

    const { wrapper, store, history } = setup("/page-c", {
      getOneData: getOneDataMock,
      setOneData: setOneDataMock,
      getTwoData: getTwoDataMock,
      setTwoData: setTwoDataMock,
    })

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(getOneDataMock).toHaveBeenCalledTimes(1)
      expect(setOneDataMock).toHaveBeenCalledTimes(1)
      expect(getTwoDataMock).toHaveBeenCalledTimes(1)
      expect(setTwoDataMock).toHaveBeenCalledTimes(1)
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should run each loader once, even when defined multiple times on the same page", () => {

  })

  it("should reset load timer after 10 seconds of the load attempt", () => {

  })

  it("should render renderFirst when first mounted", () => {

  })

  it("should render renderWithout after failDelay is passed and no data is loaded", () => {

  })

  it("should render renderWith after data is loaded successfully", () => {

  })

  it("should not run unloaders on skipped location change", () => {

  })

  it("should run unloaders on unskipped location change", () => {

  })

})
