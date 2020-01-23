import React from "react"

import { RenderController } from "src"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

import {
  FailedRender,
  FirstRender,
  SuccessfulRender,
} from "tests/setup/components"
import { SkippedPathname } from "src/types"

const skipped: SkippedPathname[] = []

export type PageProps = PageStateProps &
  PageDispatchProps & {
    mockedMethods?: {
      [key: string]: () => void,
    },
  }

export default function PageTwo({
  data,
  getData,
  setData,
  locations: { current, last },
}: PageProps) {
  return (
    <RenderController
      controllerName={"pageTwo"}
      targets={[
        {
          name: "data",
          data: data,
          empty: {},
          cached: true,
          getter: (): void => {
            getData()
          },
          setter: (obj: { name: string }): void => {
            setData(obj)
          },
        },
      ]}
      currentPathname={current.pathname}
      lastPathname={last.pathname}
      skippedPathnames={skipped}
      renderWith={() => <SuccessfulRender />}
      renderWithout={() => <FailedRender />}
      renderFirst={() => <FirstRender />}
    />
  )
}
