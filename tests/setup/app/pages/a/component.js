import React from "react"

import { RenderController } from "src"
import { SuccessfulRender, FailedRender, FirstRender } from "tests/integration/setup/components"

const skippedPathnames = []

export default function PageA({
  page: {
    oneData,
  },
  getOneData,
  setOneData,
  locations: {
    current,
    last,
  },
}) {
  return (
    <React.Fragment>
      <RenderController
        name={"pageA"}
        targets={[
          {
            name: "oneData",
            data: oneData,
            empty: {},
            cached: true,
            getter: () => getOneData(),
            setter: data => setOneData(data),
          },
        ]}
        currentPathname={current.pathname}
        lastPathname={last.pathname}
        skippedPathnames={skippedPathnames}
        renderWith={() => <SuccessfulRender />}
        renderWithout={() => <FailedRender />}
        renderFirst={() => <FirstRender />}
      />
    </React.Fragment>
  )
}
