import React, { ReactElement } from "react"

import { RenderController } from "src"

import { SuccessfulRender } from "../../../components"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

export type PageProps = PageStateProps & PageDispatchProps

export default ({
  data,
  getEmptyArray,
  setEmptyArray,
}: PageProps): ReactElement => {
  return (
    <RenderController
      controllerName={"empty-array"}
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
      renderWith={(): ReactElement => <SuccessfulRender />}
    />
  )
}
