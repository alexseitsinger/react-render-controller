import { SetDataAction } from "./actions"
import { SET_DATA } from "./constants"

export interface ReducerState {
  data: { name: string };
}

const defaultState: ReducerState = {
  data: { name: "" },
}

export default (state = defaultState, action: SetDataAction): ReducerState => {
  switch (action.type) {
    default: {
      return state
    }
    case SET_DATA: {
      return {
        ...state,
        data: action.data,
      }
    }
  }
}
