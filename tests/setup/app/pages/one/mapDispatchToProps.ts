import { Dispatch } from "redux"

import { getData, setData } from "./actions"

export interface PageDispatchProps {
  getData: () => void;
  setData: (data: object) => void;
}

export default (dispatch: Dispatch<any>): PageDispatchProps => ({
  getData: () => dispatch(getData()),
  setData: data => dispatch(setData(data)),
})
