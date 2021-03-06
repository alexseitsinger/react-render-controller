import { SetDataAction } from "./actions"
import { SET_DATA } from "./constants"

export interface ReducerState {
  data: {
    firstName: string,
    lastName: string,
  };
}

const defaultState: ReducerState = {
  data: {
    firstName: "",
    lastName: "",
  },
}

export default (state = defaultState, action: SetDataAction): ReducerState => {
  switch (action.type) {
    default: {
      return state
    }
    case SET_DATA: {
      return {
        data: action.data,
      }
    }
  }
}
