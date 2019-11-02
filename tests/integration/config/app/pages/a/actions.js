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

export const setTwoData = data => ({
  type: TWO_DATA,
  data,
})

export const getTwoData = () => dispatch => {
  dispatch(setTwoData({
    name: "two",
  }))
}

export const setThreeData = data => ({
  type: THREE_DATA,
  data,
})

export const getThreeData = () => dispatch => {
  dispatch(setThreeData({
    name: "three",
  }))
}


