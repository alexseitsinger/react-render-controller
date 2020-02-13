import React, { ReactElement } from "react"

import { RenderController } from "src"

import { FailedRender, SuccessfulRender } from "../../../components"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

export type PageProps = PageStateProps & PageDispatchProps

export default ({ data, getData, setData }: PageProps): ReactElement => {
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
      renderWith={(): ReactElement => <SuccessfulRender />}
      renderWithout={(): ReactElement => <FailedRender />}
    />
  )
}
