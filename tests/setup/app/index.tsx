import React from "react"
import { Provider } from "react-redux"
import { Route, Router } from "react-router"
import { MemoryHistory } from "history"

import PageOne from "./pages/one"
import { StoreType } from "./store"

export interface Props {
  store: StoreType;
  memoryHistory: MemoryHistory;
  mocked?: object;
}

const App = ({ store, memoryHistory, mocked }: Props) => (
  <Provider store={store}>
    <Router history={memoryHistory}>
      <Route
        path={"/page-one"}
        render={routeProps => <PageOne {...routeProps} mocked={mocked} />}
      />
    </Router>
  </Provider>
)

export default App
