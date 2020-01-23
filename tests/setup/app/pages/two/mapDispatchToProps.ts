import { ThunkDispatch } from "../../types"
import { getData, setData } from "./actions"

export interface PageDispatchProps {
  getData: () => void;
  setData: (data: { name: string }) => void;
}

export default (dispatch: ThunkDispatch): PageDispatchProps => ({
  getData: (): void => {
    dispatch(getData())
  },
  setData: (data: { name: string }): void => {
    dispatch(setData(data))
  },
})
