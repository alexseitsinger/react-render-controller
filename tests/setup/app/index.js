import React from "react"
import { Provider } from "react-redux"
import { Router, MemoryRouter, Route } from "react-router"

import PageA from "./pages/a"
import PageB from "./pages/b"
import PageC from "./pages/c"

const App = ({ store, history, mocked }) => (
  <Provider store={store}>
    <Router history={history}>
      <Route
        path={"/page-a"}
        render={routeProps => (
          <PageA {...routeProps} mocked={mocked} />
        )}
      />
      <Route
        path={"/page-b"}
        render={routeProps => (
          <PageB {...routeProps} mocked={mocked} />
        )}
      />
      <Route
        path={"/page-c"}
        render={routeProps => (
          <PageC {...routeProps} mocked={mocked} />
        )}
      />
    </Router>
  </Provider>
)

export default App

