import React from "react"

import { RenderControllerPathnames } from "./RenderController"
import { RenderFunctionType } from "./types"

export interface RenderControllerRenderProps {
  onRenderWithout?: RenderFunctionType;
  onRenderFirst?: RenderFunctionType;
}

export type RenderControllerContextProps = RenderControllerRenderProps & {
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

export const Context = React.createContext(defaultContext)
