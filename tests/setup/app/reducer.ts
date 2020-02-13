import { locationsReducer } from "@alexseitsinger/redux-locations"
import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/types/locations/reducer"
import { connectRouter } from "connected-react-router"
import { History as BrowserHistory, MemoryHistory } from "history"
import { combineReducers } from "redux"

import arrayWithMixedStringsPageReducer, {
  ReducerState as ArrayWithMixedStringsPageReducerState,
} from "./pages/array-with-mixed-strings/reducer"
import arrayWithMultipleEmptyStringsPageReducer, {
  ReducerState as ArrayWithMultipleEmptyStringsPageReducerState,
} from "./pages/array-with-multiple-empty-strings/reducer"
import emptyArrayPageReducer, {
  ReducerState as EmptyArrayPageReducerState,
} from "./pages/empty-array/reducer"
import nonEmptyArrayPageReducer, {
  ReducerState as NonEmptyArrayPageReducerState,
} from "./pages/non-empty-array/reducer"
import objectWithEmptyStringPageReducer, {
  ReducerState as ObjectWithEmptyStringPageReducerState,
} from "./pages/object-with-empty-string/reducer"
import objectWithExcludedFieldsPageReducer, {
  ReducerState as ObjectWithExcludedFieldsPageReducerState,
} from "./pages/object-with-excluded-fields/reducer"
import objectWithMixedStringsPageReducer, {
  ReducerState as ObjectWithMixedStringsPageReducerState,
} from "./pages/object-with-mixed-strings/reducer"
import objectWithNonEmptyStringPageReducer, {
  ReducerState as ObjectWithNonEmptyStringPageReducerState,
} from "./pages/object-with-non-empty-string/reducer"
import siblingPropChangePageReducer, {
  ReducerState as SiblingPropChangePageReducerState,
} from "./pages/sibling-prop-change/reducer"

export interface ReducerState {
  emptyArrayPage: EmptyArrayPageReducerState;
  nonEmptyArrayPage: NonEmptyArrayPageReducerState;
  arrayWithMultipleEmptyStringsPage: ArrayWithMultipleEmptyStringsPageReducerState;
  arrayWithMixedStringsPage: ArrayWithMixedStringsPageReducerState;
  objectWithMixedStringsPage: ObjectWithMixedStringsPageReducerState;
  objectWithEmptyStringPage: ObjectWithEmptyStringPageReducerState;
  objectWithNonEmptyStringPage: ObjectWithNonEmptyStringPageReducerState;
  objectWithExcludedFieldsPage: ObjectWithExcludedFieldsPageReducerState;
  siblingPropChangePage: SiblingPropChangePageReducerState;
  locations: LocationsReducerState;
}

type HistoryType = MemoryHistory | BrowserHistory

export default (
  routerHistory: HistoryType
): ReturnType<typeof combineReducers> =>
  combineReducers({
    router: connectRouter(routerHistory),
    emptyArrayPage: emptyArrayPageReducer,
    nonEmptyArrayPage: nonEmptyArrayPageReducer,
    arrayWithMultipleEmptyStringsPage: arrayWithMultipleEmptyStringsPageReducer,
    arrayWithMixedStringsPage: arrayWithMixedStringsPageReducer,
    objectWithMixedStringsPage: objectWithMixedStringsPageReducer,
    objectWithEmptyStringPage: objectWithEmptyStringPageReducer,
    objectWithNonEmptyStringPage: objectWithNonEmptyStringPageReducer,
    objectWithExcludedFieldsPage: objectWithExcludedFieldsPageReducer,
    siblingPropChangePage: siblingPropChangePageReducer,
    locations: locationsReducer,
  })
