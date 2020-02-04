import { ReactElement, ReactNode } from "react"

export type FunctionType = (...args: any) => void

export type RenderFunctionType = () => ReactElement

export type ChildrenType = ReactNode | ReactNode[]
