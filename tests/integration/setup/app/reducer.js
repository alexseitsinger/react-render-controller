import { combineReducers } from "redux"
import { locationsReducer } from "@alexseitsinger/redux-locations"

import pageAReducer from "./pages/a/reducer"
import pageBReducer from "./pages/b/reducer"
import pageCReducer from "./pages/c/reducer"

export default history => combineReducers({
  pageA: pageAReducer,
  pageB: pageBReducer,
  pageC: pageCReducer,
  locations: locationsReducer,
})
