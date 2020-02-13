import { SetDataAction, SetVisibleAction } from "./actions"
import { SET_DATA, SET_VISIBLE } from "./constants"

type Actions = SetDataAction | SetVisibleAction

export interface ReducerState {
  data: { name?: string };
  isVisible: boolean;
}

const defaultState: ReducerState = {
  data: {},
  isVisible: false,
}

export default (state = defaultState, action: Actions): ReducerState => {
  switch (action.type) {
    default: {
      return state
    }
    case SET_VISIBLE: {
      return {
        ...state,
        isVisible: action.bool,
      }
    }
    case SET_DATA: {
      return {
        ...state,
        data: action.data,
      }
    }
  }
}
