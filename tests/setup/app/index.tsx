import React from "react"
import { Provider } from "react-redux"
import { Route, Router } from "react-router"
import { MemoryHistory } from "history"

import PageTwo from "./pages/two"
import PageOne from "./pages/one"
import { StoreType } from "./store"
import { RenderControllerProvider } from "src"
import { FirstRender, FailedRender } from "../components"

export interface Props {
  store: StoreType;
  routerHistory: MemoryHistory;
  mockedMethods: {
    [key: string]: () => void,
  };
}

const renderControllerContext = {
  onRenderFirst: () => <FirstRender />,
  onRenderWithout: () => <FailedRender />,
}

export default ({ store, routerHistory, mockedMethods }: Props) => (
  <RenderControllerProvider context={renderControllerContext}>
    <Provider store={store}>
      <Router history={routerHistory}>
        <Route
          path={"/page-one"}
          exact
          render={routeProps => (
            <PageOne {...routeProps} mockedMethods={mockedMethods} />
          )}
        />
        <Route
          path={"/page-two"}
          exact
          render={routeProps => (
            <PageTwo {...routeProps} mockedMethods={mockedMethods} />
          )}
        />
      </Router>
    </Provider>
  </RenderControllerProvider>
)
