import waitForExpect from "wait-for-expect"

import { FailedRender, FirstRender, SuccessfulRender } from "./setup/components"
import setup from "./setup"

jest.setTimeout(20000)

// test:
// 1) data is unloaded on when navigated away, then data is re-loaded when
// navigated back.
// 2) doesnt use cached data if the cached is empty.

describe("RenderController", () => {
  it("should use renderWith for an object with an empty string", async () => {
    const { wrapper, store } = setup("/object-with-empty-string")

    //expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().objectWithEmptyStringPage.data).toStrictEqual({
        name: "",
      })
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should use RenderWithout for an empty array.", async () => {
    const { wrapper, store } = setup("/empty-array")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().emptyArrayPage.data).toStrictEqual([])
      expect(wrapper.find(FailedRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith for a non-empty array.", async () => {
    const { wrapper, store } = setup("/non-empty-array")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().nonEmptyArrayPage.data).toStrictEqual(["Alex"])
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it("should use RenderWith for an object with a non-empty string.", async () => {
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
