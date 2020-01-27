import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"
import { AnyAction } from "redux"
import { ReducerState as RootReducerState } from "../../reducer"

type ThunkAction = RealThunkAction<void, RootReducerState, undefined, AnyAction>
type ThunkDispatch = RealThunkDispatch<RootReducerState, undefined, AnyAction>

import { SET_DATA } from "./constants"

export interface SetDataAction {
  type: typeof SET_DATA;
  data: { name: string };
}

export const setData = (): SetDataAction => ({
  type: SET_DATA,
  data: {
    name: "",
  },
})

export const getData = (): ThunkAction => (dispatch: ThunkDispatch) => {
  dispatch(setData())
}