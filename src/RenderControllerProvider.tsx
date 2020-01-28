import React, { ReactElement } from "react"

import { RenderControllerContext } from "./RenderControllerContext"
import { RenderControllerProviderProps } from "./types"

export function RenderControllerProvider(
  props: RenderControllerProviderProps
): ReactElement {
  const { context, children } = props
  return (
    <RenderControllerContext.Provider value={context}>
      {children}
    </RenderControllerContext.Provider>
  )
}
