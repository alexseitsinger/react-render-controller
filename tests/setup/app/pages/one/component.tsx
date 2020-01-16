import React from "react"

import { RenderController } from "src"

import { PageDispatchProps } from "./mapDispatch"
import { PageStateProps } from "./mapState"

import {
  FailedRender,
  FirstRender,
  SuccessfulRender,
} from "~tests/setup/components"
import { SkippedPathname } from "~types"

const skippedPathnames: SkippedPathname[] = []

export type PageProps = PageStateProps & PageDispatchProps

export default function PageOne({
  data,
  getData,
  setData,
  locations: { current, last },
}: PageProps) {
  return (
    <RenderController
      name={"pageA"}
      targets={[
        {
          name: "data",
          data: data,
          empty: {},
          cached: true,
          getter: () => getData(),
          setter: obj => setData(obj),
        },
      ]}
      currentPathname={current.pathname}
      lastPathname={last.pathname}
      skippedPathnames={skippedPathnames}
      renderWith={() => <SuccessfulRender />}
      renderWithout={() => <FailedRender />}
      renderFirst={() => <FirstRender />}
    />
  )
}
