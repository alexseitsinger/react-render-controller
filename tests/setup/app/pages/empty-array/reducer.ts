import { SetEmptyArrayAction } from "./actions"
import { SET_EMPTY_ARRAY } from "./constants"

export interface ReducerState {
  data: [];
}

const defaultState: ReducerState = {
  data: [],
}

export default (
  state = defaultState,
  action: SetEmptyArrayAction
): ReducerState => {
  switch (action.type) {
    default: {
      return state
    }
    case SET_EMPTY_ARRAY: {
      return {
        data: action.data,
      }
    }
  }
}
