import { DataType,SetDataAction } from "./actions"
import { SET_DATA } from "./constants"

export interface ReducerState {
  data: DataType;
}

/**
 * We want to use default data here because we're going to exclude it from the
 * RenderController target to force it to run getData, despite not being empty.
 *
 * This occurs because when RenderController runs checkTargetsLoaded, it excludes
 * the fields specified in target.excluded from the object that gets checked.
 */
const defaultState: ReducerState = {
  data: {
    firstName: "Alex",
    lastName: "Last",
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
