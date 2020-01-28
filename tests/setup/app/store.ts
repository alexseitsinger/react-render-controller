import { createLocationsMiddleware } from "@alexseitsinger/redux-locations"
import {
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  Store,
} from "redux"
import thunk from "redux-thunk"
import { routerMiddleware } from "connected-react-router"

import createRootReducer, { ReducerState } from "./reducer"
import { MemoryHistory, History as BrowserHistory } from "history"

export type StoreType = Store<ReducerState>

type HistoryType = MemoryHistory | BrowserHistory

export default (routerHistory: HistoryType, preloadedState = {}): StoreType => {
  const rootReducer = createRootReducer(routerHistory)
  const middleware = [
    thunk,
    createLocationsMiddleware(),
    routerMiddleware(routerHistory),
  ]
  const storeEnhancers = compose(applyMiddleware(...middleware))
  const store = createReduxStore(rootReducer, preloadedState, storeEnhancers)
  return store
}
