import { AnyAction } from "redux"
import {
  ThunkAction as RealThunkAction,
  ThunkDispatch as RealThunkDispatch,
} from "redux-thunk"

import { ReducerState as RootReducerState } from "../../reducer"

type ThunkAction = RealThunkAction<void, RootReducerState, undefined, AnyAction>
type ThunkDispatch = RealThunkDispatch<RootReducerState, undefined, AnyAction>

import { SET_DATA } from "./constants"

export type DataType = {} | { firstName: string, lastName: string }

export interface SetDataAction {
  type: typeof SET_DATA;
  data: DataType;
}

/**
 * We want to set empty strings here because the defaultData are non-empty
 * strings. Changing them to empty here forces RenderController to use
 * FailedRender, and we can use that to determine if the data actually changed
 * from the excluded RenderController target.
 */
export const setData = (): SetDataAction => ({
  type: SET_DATA,
  data: { firstName: "", lastName: "" },
})

export const getData = (): ThunkAction => (dispatch: ThunkDispatch): void => {
  setTimeout(() => {
    dispatch(setData())
  }, 1000)
}
