import {
  ONE_DATA,
  TWO_DATA,
  THREE_DATA,
} from "./actionTypes"

export const setOneData = data => ({
  type: ONE_DATA,
  data,
})

export const getOneData = () => dispatch => {
  dispatch(setOneData({
    name: "one",
  }))
}


