import React, { ReactElement } from "react"

import {
  RenderControllerContext,
  RenderControllerContextProps,
} from "./RenderControllerContext"
import { ChildrenType } from "./types"

export type RenderControllerProviderProps = RenderControllerContextProps & {
  children: ChildrenType,
}

export function RenderControllerProvider(
  props: RenderControllerProviderProps
): ReactElement {
  const { onRenderFirst, onRenderWithout, getPathnames, children } = props
  return (
    <RenderControllerContext.Provider
      value={{
        onRenderWithout,
        onRenderFirst,
        getPathnames,
      }}>
      {children}
    </RenderControllerContext.Provider>
  )
}
