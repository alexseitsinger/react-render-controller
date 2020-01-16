import { FirstAction } from "./actions"
import { FIRST } from "./constants"

export interface ReducerState {
  data: object;
}

const initialState: ReducerState = {
  data: {},
}

export default (state = initialState, action: FirstAction): ReducerState => {
  switch (action.type) {
    default: {
      return state
    }
    case FIRST: {
      return {
        ...state,
        data: action.data,
      }
    }
  }
}
