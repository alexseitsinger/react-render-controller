import React from "react"

import { RenderController } from "src"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

import { SkippedPathname } from "src/types"
import { SuccessfulRender } from "../../../components"

const skipped: SkippedPathname[] = []

export type PageProps = PageStateProps &
  PageDispatchProps & {
    mockedMethods?: {
      [key: string]: () => void,
    },
  }

export default ({ data, getEmptyArray, setEmptyArray }: PageProps) => {
  return (
    <RenderController
      targets={[
        {
          name: "emptyArray",
          data: data,
          empty: [],
          getter: (): void => {
            getEmptyArray()
          },
          setter: setEmptyArray,
        },
      ]}
      skippedPathnames={skipped}
      renderWith={() => <SuccessfulRender />}
    />
  )
}
