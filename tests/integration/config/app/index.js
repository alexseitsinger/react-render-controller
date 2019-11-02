import React from "react"
import { Provider } from "react-redux"
import { MemoryRouter, Route } from "react-router"

import PageA from "./pages/a"
import PageB from "./pages/b"
import PageC from "./pages/c"

export const App = (store, history) => (
  <Provider store={store}>
    <MemoryRouter history={history}>
      <Route path={"/page-a"} component={PageA} />
      <Route path={"/page-b"} component={PageB} />
      <Route path={"/page-c"} component={PageC} />
    </MemoryRouter>
  </Provider>
)

