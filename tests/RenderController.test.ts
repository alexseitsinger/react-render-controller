import waitForExpect from "wait-for-expect"

import { FirstRender, FailedRender, SuccessfulRender } from "./setup/components"
import setup from "./setup"

jest.setTimeout(20000)

// Add tests for:
// - Assert that isControllerSeen is checked and only changed once via
// constructor-created setControllerSeen method.
// - Data is unloaded when currentPathname changes, and then re-loaded when
// currentPathname changes back.
// - Doesnt use cached data is the cache is empty.

describe("RenderController", () => {
  it("should use renderWithout after returning empty object from an object with excluded fields.", async () => {
    const { wrapper, store } = setup("/object-with-excluded-fields")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    expect(store.getState().objectWithExcludedFieldsPage.data).toStrictEqual({
      firstName: "Alex",
      lastName: "Last",
    })
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().objectWithExcludedFieldsPage.data).toStrictEqual({
        firstName: "",
        lastName: "",
      })
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should use renderWithout after getData returns an object with only empty strings", async () => {
    const { wrapper, store } = setup("/object-with-empty-string")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().objectWithEmptyStringPage.data).toStrictEqual({
        name: "",
      })
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should use RenderWithout after getData returns an array multiple empty strings.", async () => {
    const { wrapper, store } = setup("/array-with-multiple-empty-strings")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(
        store.getState().arrayWithMultipleEmptyStringsPage.data
      ).toStrictEqual(["", ""])
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith after getData returns an array with mixed strings.", async () => {
    const { wrapper, store } = setup("/array-with-mixed-strings")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().arrayWithMixedStringsPage.data).toStrictEqual([
        "Alex",
        "",
      ])
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should use RenderWithout after getData returns an empty array.", async () => {
    const { wrapper, store } = setup("/empty-array")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().emptyArrayPage.data).toStrictEqual([])
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith after getData returns a non-empty array.", async () => {
    const { wrapper, store } = setup("/non-empty-array")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().nonEmptyArrayPage.data).toStrictEqual(["Alex"])
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith after getData returns an object with a non-empty string.", async () => {
    const { wrapper, store } = setup("/object-with-non-empty-string")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().objectWithNonEmptyStringPage.data).toStrictEqual({
        name: "Alex",
      })
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith after getData returns an object with mixed strings.", async () => {
    const { wrapper, store } = setup("/object-with-mixed-strings")

    //expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().objectWithMixedStringsPage.data).toStrictEqual({
        firstName: "Alex",
        lastName: "",
      })
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it.todo(
    "should run each loader once, even when defined multiple times on the same page"
  )

  it.todo("should reset load timer after 10 seconds of the load attempt")

  it.todo("should render renderFirst when first mounted")

  it.todo(
    "should render renderWithout after failDelay is passed and no data is loaded"
  )

  it.todo("should render renderWith after data is loaded successfully")

  it.todo("should not run unloaders on skipped location change")

  it.todo("should run unloaders on unskipped location change")
})
