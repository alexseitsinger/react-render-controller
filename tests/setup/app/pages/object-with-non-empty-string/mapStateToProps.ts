import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/types/locations/reducer"

import { ReducerState as RootReducerState } from "tests/setup/app/reducer"

import { ReducerState as PageReducerState } from "./reducer"

export type PageStateProps = PageReducerState & {
  locations: LocationsReducerState,
}

export default (state: RootReducerState): PageStateProps => ({
  data: state.objectWithNonEmptyStringPage.data,
  locations: state.locations,
})
