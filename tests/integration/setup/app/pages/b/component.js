import React from "react"

import { RenderController } from "src"
import { SuccessfulRender, FailedRender, FirstRender } from "tests/integration/setup/components"

const skippedPathnames = []

export default function PageB({
  page: {
    oneData,
    twoData,
  },
  getOneData,
  setOneData,
  locations: {
    current,
    last,
  },
}) {
  return (
    <RenderController
      name={"pageB"}
      targets={[
        {
          name: "twoData",
          data: twoData,
          empty: {},
          cached: true,
          getter: getOneData,
          setter: setOneData,
        },
      ]}
      currentPathname={current.pathname}
      lastPathname={last.pathname}
      skippedPathnames={skippedPathnames}
      renderFirst={() => <FirstRender />}
      renderWith={() => <SuccessfulRender />}
      renderWithout={() => <FailedRender />}
    />
  )
}
