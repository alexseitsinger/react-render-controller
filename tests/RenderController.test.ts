import waitForExpect from "wait-for-expect"

import { FailedRender, FirstRender, SuccessfulRender } from "./setup/components"
import setup from "./setup"

jest.setTimeout(20000)

// test:
// 1) data is unloaded on when navigated away, then data is re-loaded when
// navigated back.
// 2) doesnt use cached data if the cached is empty.

describe("RenderController", () => {
  it.only("should load data, then after success, use renderWith", async () => {
    const { wrapper, store } = setup("/page-one")

    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().pageOne.data).toStrictEqual({ name: "one" })
      expect(wrapper.find(SuccessfulRender)).toHaveLength(1)
    })
  })

  it.only("should attempt to load data, then after failure, use renderWithout", async () => {
    const { wrapper, store } = setup("/page-two")

    expect(wrapper.find(FirstRender)).toHaveLength(1)
    await waitForExpect(() => {
      wrapper.update()
      expect(store.getState().pageTwo.data).toStrictEqual({ name: "" })
      expect(wrapper.find(FailedRender)).toHaveLength(1)
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
