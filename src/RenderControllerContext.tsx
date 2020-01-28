import React from "react"

import { RenderControllerContextProps } from "./types"

const defaultContext: RenderControllerContextProps = {
  onRenderFirst: () => <></>,
  onRenderWithout: () => <></>,
  store: undefined,
}

export const RenderControllerContext = React.createContext(defaultContext)
