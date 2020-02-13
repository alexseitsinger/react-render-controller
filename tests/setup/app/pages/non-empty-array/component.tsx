import React, { ReactElement } from "react"

import { RenderController } from "src"

import { SuccessfulRender } from "../../../components"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

export type PageProps = PageStateProps & PageDispatchProps

export default ({ data, getData, setData }: PageProps): ReactElement => {
  return (
    <RenderController
      controllerName={"non-empty-array"}
      targets={[
        {
          name: "non-empty-array",
          data: data,
          empty: [],
          getter: (): void => {
            getData()
          },
          setter: setData,
        },
      ]}
      renderWith={(): ReactElement => <SuccessfulRender />}
    />
  )
}
