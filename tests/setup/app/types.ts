import { AnyAction } from "redux"
import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"

import { ReducerState as RootReducerState } from "./reducer"

export interface MockedMethods {
  [key: string]: (...args: any) => void;
}

export type ThunkAction = RealThunkAction<
  void,
  RootReducerState,
  undefined,
  AnyAction
>
export type ThunkDispatch = RealThunkDispatch<
  RootReducerState,
  undefined,
  AnyAction
>
