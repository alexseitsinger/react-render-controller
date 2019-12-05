import React from "react"

import { RenderController } from "src"
import { SuccessfulRender, FailedRender, FirstRender } from "tests/integration/setup/components"

const skippedPathnames = []

export default function PageC({
  page: {
    oneData,
    twoData,
  },
  getOneData,
  setOneData,
  getTwoData,
  setTwoData,
  locations: {
    current,
    last,
  },
}) {
  return (
    <RenderController
      name={"pageC"}
      targets={[
        {
          name: "oneData",
          data: oneData,
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
      renderWith={() => {
        console.log("rendering #2")
        return (
          <RenderController
            name={"pageC-2"}
            targets={[
              {
                name: "twoData",
                data: twoData,
                empty: {},
                cached: true,
                getter: getTwoData,
                setter: setTwoData,
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
      }}
      renderWithout={() => <FailedRender />}
    />
  )
}
