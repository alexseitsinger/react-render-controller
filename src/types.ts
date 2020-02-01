import { ReactElement, ReactNode } from "react"

export type FunctionType = (...args: any) => void

export type RenderFunctionType = () => ReactElement

export type ChildrenType = ReactNode | ReactNode[]

export interface LocationProps {
  lastPathname: string;
  currentPathname: string;
}

export interface SkippedPathname {
  from: string;
  to: string;
  reverse?: boolean;
}

export type AddUnloaderArgs = LocationProps & {
  skippedPathnames: SkippedPathname[],
  handler: FunctionType,
  name: string,
}

export interface Loaders {
  [key: string]: FunctionType;
}

interface DataObject {
  [key: string]: any;
}

type DataArray = string[] | []

export type DataType = DataObject | DataArray

export interface LoadTarget {
  name: string;
  data: DataType;
  getter: FunctionType;
  setter: FunctionType;
  empty: {} | [];
  excluded?: string[];
  forced?: boolean;
  cached?: boolean;
  attempted?: boolean;
}
