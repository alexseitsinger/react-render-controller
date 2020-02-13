import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/types/locations/reducer"

import { ReducerState as RootReducerState } from "tests/setup/app/reducer"

import { ReducerState as PageReducerState } from "./reducer"

export type PageStateProps = PageReducerState & {
  locations: LocationsReducerState,
  data: string[] | [],
}

export default (state: RootReducerState): PageStateProps => ({
  data: state.arrayWithMultipleEmptyStringsPage.data,
  locations: state.locations,
})
