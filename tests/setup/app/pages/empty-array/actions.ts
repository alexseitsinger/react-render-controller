import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"
import { AnyAction } from "redux"
import { ReducerState as RootReducerState } from "../../reducer"

type ThunkAction = RealThunkAction<void, RootReducerState, undefined, AnyAction>
type ThunkDispatch = RealThunkDispatch<RootReducerState, undefined, AnyAction>

import { SET_EMPTY_ARRAY } from "./constants"

export interface SetEmptyArrayAction {
  type: typeof SET_EMPTY_ARRAY;
  data: [];
}

export const setEmptyArray = (): SetEmptyArrayAction => ({
  type: SET_EMPTY_ARRAY,
  data: [],
})

export const getEmptyArray = (): ThunkAction => (dispatch: ThunkDispatch) => {
  setTimeout(() => {
    dispatch(setEmptyArray())
  }, 1000)
}
