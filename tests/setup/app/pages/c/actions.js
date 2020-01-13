import {
  ONE_DATA,
  TWO_DATA,
  THREE_DATA,
} from "./actionTypes"

export const setOneData = data => ({
  type: ONE_DATA,
  data,
})

export const getOneData = setter => dispatch => {
  const data = {
    name: "one",
  }
  if (setter) {
    setter(data)
  }
  else {
    dispatch(setOneData(data))
  }
}

export const setTwoData = data => ({
  type: "TWO_DATA",
  data,
})

export const getTwoData = setter => dispatch => {
  const data = {
    name: "two",
  }
  if (setter) {
    setter(data)
  }
  else {
    dispatch(setTwoData(data))
  }
}


