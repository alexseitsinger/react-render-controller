import { ThunkDispatch } from "../../types"

import { getData, setData, setVisible } from "./actions"

export interface PageDispatchProps {
  getData: () => void;
  setData: () => void;
  setVisible: (bool: boolean) => void;
}

export default (dispatch: ThunkDispatch): PageDispatchProps => ({
  getData: (): void => {
    dispatch(getData())
  },
  setData: (): void => {
    dispatch(setData())
  },
  setVisible: (bool: boolean): void => {
    dispatch(setVisible(bool))
  },
})
