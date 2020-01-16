import { Dispatch } from "redux"

import { FIRST } from "./constants"

export interface FirstAction {
  type: typeof FIRST;
  data: object;
}

export const setData = (data: object): FirstAction => ({
  type: FIRST,
  data,
})

export const getData = () => (dispatch: Dispatch<any>) => {
  dispatch(
    setData({
      name: "one",
    })
  )
}
