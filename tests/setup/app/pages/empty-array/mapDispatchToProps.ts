import { ThunkDispatch } from "../../types"

import { getEmptyArray, setEmptyArray } from "./actions"

export interface PageDispatchProps {
  getEmptyArray: () => void;
  setEmptyArray: () => void;
}

export default (dispatch: ThunkDispatch): PageDispatchProps => ({
  getEmptyArray: (): void => {
    dispatch(getEmptyArray())
  },
  setEmptyArray: (): void => {
    dispatch(setEmptyArray())
  },
})
