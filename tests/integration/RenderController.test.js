import React from "react"

import { RenderController } from "../src"
import { setup } from "./page/setup"

describe("RenderController", () => {

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
