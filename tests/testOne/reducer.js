import {
  ONE_DATA,
  TWO_DATA,
  THREE_DATA,
} from "./actionTypes"

const initialState = {
  oneData: {},
  twoData: {},
  threeData: {},
}

export const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    default: {
      return state
    }
    case ONE_DATA: {
      return {
        ...state,
        oneData: action.data,
      }
    }
    case TWO_DATA: {
      return {
        ...state,
        twoData: action.data,
      }
    }
    case THREE_DATA: {
      return {
        ...state,
        threeData: action.data,
      }
    }
  }
}
