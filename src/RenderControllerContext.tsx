import React from "react"

import { RenderFunctionType } from "./types"

export interface RenderControllerContextRenderMethods {
  onRenderWithout?: RenderFunctionType;
  onRenderFirst?: RenderFunctionType;
}

export type RenderControllerContextProps = RenderControllerContextRenderMethods & {
  getPathnames: () => { lastPathname: string, currentPathname: string },
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
