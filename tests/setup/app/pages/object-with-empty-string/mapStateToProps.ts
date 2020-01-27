import { ReducerState as PageReducerState } from "./reducer"

import { ReducerState as RootReducerState } from "tests/setup/app/reducer"
import { LocationsReducerState } from "@alexseitsinger/redux-locations/dist/locations/reducer"

export type PageStateProps = PageReducerState & {
  locations: LocationsReducerState,
}

export default (state: RootReducerState): PageStateProps => ({
  data: state.objectWithEmptyStringPage.data,
  locations: state.locations,
})
