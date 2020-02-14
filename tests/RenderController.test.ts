import waitForExpect from "wait-for-expect"

import { setConfig } from "src"
import { ToggleButton } from "tests/setup/app/pages/sibling-prop-change/component"

import setup from "./setup"
import { FailedRender, FirstRender, SuccessfulRender } from "./setup/components"

jest.setTimeout(20000)

setConfig({
  debugLevels: {
    pathnames: 0,
    controller: 0,
    completing: 0,
    counting: 0,
    loading: 0,
    unloading: 0,
    mounting: 0,
  },
})

// Add tests for:
//
// - Confirm that 'isControllerCompleted' is checked and only changed once via
//   constructor-created 'setControllerCompleted' method.
//
// - Confirm that 'isControllerCompleted' reflects the correct initial value,
//   based on the stored value from the 'completed' module.
//
// - 'data' is unloaded from navigating away, then re-loaded again upon returning.
//
// - Clears 'skippedPathnames' when unmounted finally.
//
// - Doesn't re-run parent 'getters' from rendering nested controllers.
//
// - Confirm that renderFirst() is run each time a new controller(s) is/are
//   first mounted.
//
// - Confirm that 'skippedPathnames' prevents unloading 'data' when navigating
//   to a matching url.

describe("RenderController", () => {
  it("should not re-get data when sibling elements props change", async () => {
    const onSetData = jest.fn()
    const onGetData = jest.fn()
    const onSetVisible = jest.fn()

    const { wrapper, store } = setup("/sibling-prop-change", {
      onSetData,
      onGetData,
      onSetVisible,
    })

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    expect(store.getState().siblingPropChangePage).toStrictEqual({
      data: {},
      isVisible: false,
    })

    await waitForExpect(() => {
      wrapper.update()

      expect(store.getState().siblingPropChangePage.data).toStrictEqual({
        name: "Alex",
      })
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)

      expect(onGetData).toHaveBeenCalledTimes(1)
      // The setter is only invoked when we're clearing data or forcing.
      expect(onSetData).toHaveBeenCalledTimes(0)
      expect(onSetVisible).toHaveBeenCalledTimes(0)

      wrapper
        .find(ToggleButton)
        .props()
        .onClick()

      wrapper.update()

      expect(store.getState().siblingPropChangePage.isVisible).toStrictEqual(
        true
      )
      expect(onGetData).toHaveBeenCalledTimes(1)
      expect(onSetData).toHaveBeenCalledTimes(0)
      expect(onSetVisible).toHaveBeenCalledTimes(1)
    })
  })

  it("should use renderWithout after returning empty object from an object with excluded fields.", async () => {
    const { wrapper, store } = setup("/object-with-excluded-fields", {})

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
    const { wrapper, store } = setup("/object-with-empty-string", {})

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
    const { wrapper, store } = setup("/array-with-multiple-empty-strings", {})

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
    const { wrapper, store } = setup("/array-with-mixed-strings", {})

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
    const { wrapper, store } = setup("/empty-array", {})

    expect(wrapper.find(FirstRender)).toHaveLength(1)

    await waitForExpect(() => {
      wrapper.update()

      expect(store.getState().emptyArrayPage.data).toStrictEqual([])
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith after getData returns a non-empty array.", async () => {
    const { wrapper, store } = setup("/non-empty-array", {})

    expect(wrapper.find(FirstRender)).toHaveLength(1)

    await waitForExpect(() => {
      wrapper.update()

      expect(store.getState().nonEmptyArrayPage.data).toStrictEqual(["Alex"])
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith after getData returns an object with a non-empty string.", async () => {
    const { wrapper, store } = setup("/object-with-non-empty-string", {})

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
    const { wrapper, store } = setup("/object-with-mixed-strings", {})

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
