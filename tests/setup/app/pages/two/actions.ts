import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"
import { AnyAction } from "redux"
import { ReducerState as RootReducerState } from "../../reducer"

type ThunkAction = RealThunkAction<void, RootReducerState, undefined, AnyAction>
type ThunkDispatch = RealThunkDispatch<RootReducerState, undefined, AnyAction>

import { FIRST } from "./constants"

export interface FirstAction {
  type: typeof FIRST;
  data: { name: string };
}

export const setData = (data: { name: string }): FirstAction => ({
  type: FIRST,
  data,
})

export const getData = (): ThunkAction => (dispatch: ThunkDispatch) => {
  dispatch(
    setData({
      name: "",
    })
  )
}
