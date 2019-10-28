import {
  getOneData,
  setOneData,
  getTwoData,
  setTwoData,
  getThreeData,
  setThreeData,
} from "./actions"

export const mapDispatch = dispatch => ({
  loadOneData: () => dispatch(getOneData()),
  unloadOneData: () => dispatch(setOneData({})),
  loadTwoData: () => dispatch(getTwoData()),
  unloadTwoData: () => dispatch(setTwoData({})),
  loadThreeData: () => dispatch(getThreeData()),
  unloadThreeData: () => dispatch(setThreeData({})),
})

