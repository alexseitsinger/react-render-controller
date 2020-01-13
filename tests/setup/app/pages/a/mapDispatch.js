import {
  getOneData,
  setOneData,
} from "./actions"

export default dispatch => ({
  getOneData: () => dispatch(getOneData()),
  setOneData: data => dispatch(setOneData(data)),
})

