import { ThunkDispatch } from "../../types"
import { getData, setData } from "./actions"

export interface PageDispatchProps {
  getData: () => void;
  setData: () => void;
}

export default (dispatch: ThunkDispatch): PageDispatchProps => ({
  getData: (): void => {
    dispatch(getData())
  },
  setData: (): void => {
    dispatch(setData())
  },
})
