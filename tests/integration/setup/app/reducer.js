import { PageAReducer } from "./pages/a/reducer"
import { PageBReducer } from "./pages/b/reducer"
import { PageCReducer } from "./pages/c/reducer"

export const createRootReducer = history => combineReducers({
  a: pageAReducer,
  b: pageBReducer,
  c: pageCReducer,
})
