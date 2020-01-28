import React from "react"

import { RenderController } from "src"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

import { SkippedPathname } from "src/types"
import { SuccessfulRender, FailedRender } from "../../../components"

const skipped: SkippedPathname[] = []

export type PageProps = PageStateProps &
  PageDispatchProps & {
    mockedMethods?: {
      [key: string]: () => void,
    },
  }

export default ({
  data,
  getData,
  setData,
  locations: { current, last },
}: PageProps) => {
  return (
    <RenderController
      controllerName={"object-with-excluded-fields"}
      targets={[
        {
          name: "data",
          data: data,
          excluded: ["firstName", "lastName"],
          empty: [],
          getter: (): void => {
            getData()
          },
          setter: setData,
        },
      ]}
      currentPathname={current.pathname}
      lastPathname={last.pathname}
      skippedPathnames={skipped}
      renderWith={() => <SuccessfulRender />}
      renderWithout={() => <FailedRender />}
    />
  )
}
