import React, { ReactElement } from "react"

import { RenderController } from "src"
import { SuccessfulRender } from "tests/setup/components"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

export type PageProps = PageStateProps & PageDispatchProps

export default ({ data, getData, setData }: PageProps): ReactElement => {
  return (
    <RenderController
      controllerName={"object-with-empty-string"}
      targets={[
        {
          name: "data",
          data: data,
          empty: {},
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
