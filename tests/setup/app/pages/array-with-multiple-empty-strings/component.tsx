import React, { ReactElement } from "react"

import { RenderController } from "src"
import { RenderControllerSkippedPathname } from "src/RenderController"

import { SuccessfulRender } from "../../../components"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

const skipped: RenderControllerSkippedPathname[] = []

export type PageProps = PageStateProps &
  PageDispatchProps & {
    mockedMethods?: {
      [key: string]: () => void,
    },
  }

export default ({ data, getData, setData }: PageProps): ReactElement => {
  return (
    <RenderController
      controllerName={"array-with-multiple-strings-controller"}
      targets={[
        {
          name: "data",
          data: data,
          empty: [],
          getter: (): void => {
            getData()
          },
          setter: setData,
        },
      ]}
      skippedPathnames={skipped}
      renderWith={(): ReactElement => <SuccessfulRender />}
    />
  )
}
