import { locationsReducer } from "@alexseitsinger/redux-locations"
import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/locations/reducer"
import { combineReducers } from "redux"

import objectWithExcludedFieldsPageReducer, {
  ReducerState as ObjectWithExcludedFieldsPageReducerState,
} from "./pages/object-with-excluded-fields/reducer"

import objectWithEmptyStringPageReducer, {
  ReducerState as ObjectWithEmptyStringPageReducerState,
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
  ReducerState as ArrayWithMultipleEmptyStringsPageReducerState,
} from "./pages/array-with-multiple-empty-strings/reducer"

export interface ReducerState {
  emptyArrayPage: EmptyArrayPageReducerState;
  nonEmptyArrayPage: NonEmptyArrayPageReducerState;
  arrayWithMultipleEmptyStringsPage: ArrayWithMultipleEmptyStringsPageReducerState;
  arrayWithMixedStringsPage: ArrayWithMixedStringsPageReducerState;
  objectWithMixedStringsPage: ObjectWithMixedStringsPageReducerState;
  objectWithEmptyStringPage: ObjectWithEmptyStringPageReducerState;
  objectWithNonEmptyStringPage: ObjectWithNonEmptyStringPageReducerState;
  objectWithExcludedFieldsPage: ObjectWithExcludedFieldsPageReducerState;
  locations: LocationsReducerState;
}

export default () =>
  combineReducers({
    emptyArrayPage: emptyArrayPageReducer,
    nonEmptyArrayPage: nonEmptyArrayPageReducer,
    arrayWithMultipleEmptyStringsPage: arrayWithMultipleEmptyStringsPageReducer,
    arrayWithMixedStringsPage: arrayWithMixedStringsPageReducer,
    objectWithMixedStringsPage: objectWithMixedStringsPageReducer,
    objectWithEmptyStringPage: objectWithEmptyStringPageReducer,
    objectWithNonEmptyStringPage: objectWithNonEmptyStringPageReducer,
    objectWithExcludedFieldsPage: objectWithExcludedFieldsPageReducer,
    locations: locationsReducer,
  })
