import { locationsReducer } from "@alexseitsinger/redux-locations"
import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/locations/reducer"
import { combineReducers } from "redux"

import objectWithEmptyStringPageReducer, {
  ReducerState as ObjectWithEmptyStringReducerState,
} from "./pages/object-with-empty-string/reducer"

import emptyArrayPageReducer, {
  ReducerState as EmptyArrayPageReducerState,
} from "./pages/empty-array/reducer"

import nonEmptyArrayPageReducer, {
  ReducerState as NonEmptyArrayPageReducerState,
} from "./pages/non-empty-array/reducer"

import objectWithNonEmptyStringPageReducer, {
  ReducerState as ObjectWithNonEmptyStringPageReducerState,
} from "./pages/object-with-non-empty-string/reducer"

export interface ReducerState {
  objectWithEmptyStringPage: ObjectWithEmptyStringReducerState;
  emptyArrayPage: EmptyArrayPageReducerState;
  nonEmptyArrayPage: NonEmptyArrayPageReducerState;
  objectWithNonEmptyStringPage: ObjectWithNonEmptyStringPageReducerState;
  locations: LocationsReducerState;
}

export default () =>
  combineReducers({
    objectWithEmptyStringPage: objectWithEmptyStringPageReducer,
    emptyArrayPage: emptyArrayPageReducer,
    nonEmptyArrayPage: nonEmptyArrayPageReducer,
    objectWithNonEmptyStringPage: objectWithNonEmptyStringPageReducer,
    locations: locationsReducer,
  })
