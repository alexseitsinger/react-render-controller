import React from "react"

import { RenderController } from "src"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

import { SuccessfulRender } from "../../../components"

export type PageProps = PageStateProps &
  PageDispatchProps & {
    mockedMethods?: {
      [key: string]: () => void,
    },
  }

export default ({ data, getData, setData }: PageProps) => {
  return (
    <RenderController
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
      renderWith={() => <SuccessfulRender />}
    />
  )
}
