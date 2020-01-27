import { SetDataAction } from "./actions"
import { SET_DATA } from "./constants"

export interface ReducerState {
  data: string[] | [];
}

const defaultState: ReducerState = {
  data: [],
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
