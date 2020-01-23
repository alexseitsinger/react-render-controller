import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"

import { ReducerState as RootReducerState } from "./reducer"
import { AnyAction } from "redux"

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
