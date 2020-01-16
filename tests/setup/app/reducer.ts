import { locationsReducer } from "@alexseitsinger/redux-locations"
import { combineReducers } from "redux"

import pageOneReducer, { PageOneReducerState } from "./pages/one/reducer"

export interface ReducerState {
  pageOne: PageOneReducerState;
  locations: LocationsReducerState;
}

export default () => combineReducers({
  pageOne: pageOneReducer,
  locations: locationsReducer,
})
