import { locationsReducer } from "@alexseitsinger/redux-locations"
import { combineReducers } from "redux"

import pageOneReducer, {
  ReducerState as PageOneReducerState,
} from "./pages/one/reducer"
import pageTwoReducer, {
  ReducerState as PageTwoReducerState,
} from "./pages/two/reducer"
import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/locations/reducer"

export interface ReducerState {
  pageOne: PageOneReducerState;
  pageTwo: PageTwoReducerState;
  locations: LocationsReducerState;
}

export default () =>
  combineReducers({
    pageOne: pageOneReducer,
    pageTwo: pageTwoReducer,
    locations: locationsReducer,
  })
