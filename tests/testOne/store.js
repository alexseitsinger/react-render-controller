import {
  createStore as createReduxStore,
  compose,
  applyMiddleware,
} from "redux"

import { rootReducer } from "./reducer"

export const createStore = (history, initialState) => {
  const middleware = []
  const storeEnhancers = compose(applyMiddleware(...middleware))
  return createReduxStore(rootReducer, initialState, storeEnhancers)
}
