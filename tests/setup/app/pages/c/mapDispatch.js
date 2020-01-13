import {
  getOneData,
  setOneData,
  getTwoData,
  setTwoData,
} from "./actions"

export default dispatch => ({
  getOneData: () => dispatch(getOneData()),
  setOneData: data => dispatch(setOneData(data)),
  getTwoData: () => dispatch(getTwoData()),
  setTwoData: data => dispatch(setTwoData(data)),
})

