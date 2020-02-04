import React from "react"

import { RenderControllerPathnames } from "./RenderController"
import { RenderFunctionType } from "./types"

export interface RenderControllerContextRenderMethods {
  onRenderWithout?: RenderFunctionType;
  onRenderFirst?: RenderFunctionType;
}

export type RenderControllerContextProps = RenderControllerContextRenderMethods & {
  getPathnames: () => RenderControllerPathnames,
}

const defaultContext: RenderControllerContextProps = {
  onRenderFirst: () => <></>,
  onRenderWithout: () => <></>,
  getPathnames: () => ({
    lastPathname: "/",
    currentPathname: "/",
  }),
}

export const RenderControllerContext = React.createContext(defaultContext)
