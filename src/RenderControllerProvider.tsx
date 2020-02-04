import React, { ReactElement } from "react"

import {
  Context,
  RenderControllerContextProps,
} from "./RenderControllerContext"
import { ChildrenType } from "./types"

type RenderControllerProviderProps = RenderControllerContextProps & {
  children: ChildrenType,
}

export function RenderControllerProvider(
  props: RenderControllerProviderProps
): ReactElement {
  const { onRenderFirst, onRenderWithout, getPathnames, children } = props
  return (
    <Context.Provider
      value={{
        onRenderWithout,
        onRenderFirst,
        getPathnames,
      }}>
      {children}
    </Context.Provider>
  )
}
