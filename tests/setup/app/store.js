import {
  createStore as createReduxStore,
  compose,
  applyMiddleware,
} from "redux"
import thunk from "redux-thunk"
import { createLocationsMiddleware} from "@alexseitsinger/redux-locations"

import createRootReducer from "./reducer"

const locationsMiddleware = createLocationsMiddleware()

export default (history, initialState={}) => {
  const rootReducer = createRootReducer(history)
  const middleware = [thunk, locationsMiddleware]
  const storeEnhancers = compose(applyMiddleware(...middleware))
  const store = createReduxStore(rootReducer, initialState, storeEnhancers)
  return store
}
