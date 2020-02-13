import React, { ReactElement } from "react"

import { RenderController } from "src"
import { MockedMethods } from "tests/setup/app/types"

import { SuccessfulRender } from "../../../components"

import { PageDispatchProps } from "./mapDispatchToProps"
import { PageStateProps } from "./mapStateToProps"

type PageProps = PageStateProps &
  PageDispatchProps & {
    mockedMethods: MockedMethods,
  }

export function SiblingElement({
  isVisible,
}: {
  isVisible: boolean,
}): ReactElement {
  return <div>{isVisible ? <span>Toggled Element</span> : null}</div>
}

export function ToggleButton({
  onClick,
}: {
  onClick: () => void,
}): ReactElement {
  return (
    <button type={"button"} onClick={onClick}>
      Toggle Button
    </button>
  )
}

export default ({
  data,
  getData,
  setData,
  isVisible,
  setVisible,
  mockedMethods: { onSetVisible, onGetData, onSetData },
}: PageProps): ReactElement => {
  return (
    <>
      <SiblingElement isVisible={isVisible} />
      <ToggleButton
        onClick={(): void => {
          const nextValue = !isVisible
          onSetVisible(nextValue)
          setVisible(nextValue)
        }}
      />
      <RenderController
        controllerName={"sibling-element-prop-change"}
        targets={[
          {
            name: "data",
            data: data,
            empty: [],
            getter: (): void => {
              onGetData(data)
              getData()
            },
            setter: (newData?: any): void => {
              onSetData(data, newData)
              setData()
            },
          },
        ]}
        renderWith={(): ReactElement => {
          return <SuccessfulRender />
        }}
      />
    </>
  )
}
