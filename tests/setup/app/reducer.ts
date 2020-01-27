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

import objectWithMixedStringsPageReducer, {
  ReducerState as ObjectWithMixedStringsPageReducerState,
} from "./pages/object-with-mixed-strings/reducer"

import arrayWithMixedStringsPageReducer, {
  ReducerState as ArrayWithMixedStringsPageReducerState,
} from "./pages/array-with-mixed-strings/reducer"

import arrayWithMultipleEmptyStringsPageReducer, {
  ReducerState as ArrayWithMultipleEmptyStringsReducerState,
} from "./pages/array-with-multiple-empty-strings/reducer"

export interface ReducerState {
  arrayWithMultipleEmptyStringsPage: ArrayWithMultipleEmptyStringsReducerState;
  arrayWithMixedStringsPage: ArrayWithMixedStringsPageReducerState;
  objectWithMixedStringsPage: ObjectWithMixedStringsPageReducerState;
  objectWithEmptyStringPage: ObjectWithEmptyStringReducerState;
  emptyArrayPage: EmptyArrayPageReducerState;
  nonEmptyArrayPage: NonEmptyArrayPageReducerState;
  objectWithNonEmptyStringPage: ObjectWithNonEmptyStringPageReducerState;
  locations: LocationsReducerState;
}

export default () =>
  combineReducers({
    arrayWithMultipleEmptyStringsPage: arrayWithMultipleEmptyStringsPageReducer,
    arrayWithMixedStringsPage: arrayWithMixedStringsPageReducer,
    objectWithMixedStringsPage: objectWithMixedStringsPageReducer,
    objectWithEmptyStringPage: objectWithEmptyStringPageReducer,
    emptyArrayPage: emptyArrayPageReducer,
    nonEmptyArrayPage: nonEmptyArrayPageReducer,
    objectWithNonEmptyStringPage: objectWithNonEmptyStringPageReducer,
    locations: locationsReducer,
  })
