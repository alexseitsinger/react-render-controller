import {
  createStore as createReduxStore,
  compose,
  applyMiddleware,
} from "redux"

export const createStore = (history, initialState) => {
  const rootReducer = createRootReducer(history)
  const middleware = []
  const storeEnhancers = compose(applyMiddleware(...middleware))
  return createReduxStore(rootReducer, initialState, storeEnhancers)
}
