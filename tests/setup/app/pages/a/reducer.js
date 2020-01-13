import {
  ONE_DATA,
} from "./actionTypes"

const initialState = {
  oneData: {},
}

export default (state = initialState, action) => {
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
  }
}
