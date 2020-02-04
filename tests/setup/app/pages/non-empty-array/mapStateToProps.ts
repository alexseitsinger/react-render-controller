import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/locations/reducer"

import { ReducerState as RootReducerState } from "tests/setup/app/reducer"

import { ReducerState as PageReducerState } from "./reducer"

export type PageStateProps = PageReducerState & {
  locations: LocationsReducerState,
  data: string[] | [],
}

export default (state: RootReducerState): PageStateProps => ({
  data: state.nonEmptyArrayPage.data,
  locations: state.locations,
})
