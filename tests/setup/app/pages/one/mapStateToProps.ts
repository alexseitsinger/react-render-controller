// @ts-ignore
import { LocationsReducerState } from "@alexseitsinger/redux-locations"

import { ReducerState } from "./reducer"

import { ReducerState as RootState } from "~tests/setup/app/reducer"

export type PageStateProps = ReducerState & LocationsReducerState

export default (state: RootState): PageStateProps => ({
  data: state.pageOne.data,
  locations: state.locations,
})
