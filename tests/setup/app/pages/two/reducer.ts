import { FirstAction } from "./actions"
import { FIRST } from "./constants"

export interface ReducerState {
  data: {
    name: string,
  };
}

const defaultState: ReducerState = {
  data: {
    name: "",
  },
}

export default (state = defaultState, action: FirstAction): ReducerState => {
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
