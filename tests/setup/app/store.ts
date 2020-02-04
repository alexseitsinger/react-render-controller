import { createLocationsMiddleware } from "@alexseitsinger/redux-locations"
import { routerMiddleware } from "connected-react-router"
import { History as BrowserHistory, MemoryHistory } from "history"
import {
  applyMiddleware,
  compose,
  createStore as createReduxStore,
  Store,
} from "redux"
import thunk from "redux-thunk"

import createRootReducer, { ReducerState } from "./reducer"

export type StoreType = Store<ReducerState>

type HistoryType = MemoryHistory | BrowserHistory

export default (routerHistory: HistoryType, preloadedState = {}): Store => {
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
