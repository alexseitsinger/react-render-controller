import { AnyAction } from "redux"
import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"

import { ReducerState as RootReducerState } from "../../reducer"

type ThunkAction = RealThunkAction<void, RootReducerState, undefined, AnyAction>
type ThunkDispatch = RealThunkDispatch<RootReducerState, undefined, AnyAction>

import { SET_DATA, SET_VISIBLE } from "./constants"

export interface SetDataAction {
  type: typeof SET_DATA;
  data: {} | { name: string };
}

export const setData = (): SetDataAction => ({
  type: SET_DATA,
  data: { name: "Alex" },
})

export const getData = (): ThunkAction => (dispatch: ThunkDispatch): void => {
  setTimeout(() => {
    dispatch(setData())
  }, 300)
}

export interface SetVisibleAction {
  type: typeof SET_VISIBLE;
  bool: boolean;
}

export const setVisible = (bool: boolean): SetVisibleAction => ({
  type: SET_VISIBLE,
  bool,
})
