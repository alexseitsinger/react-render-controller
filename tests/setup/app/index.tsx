import React from "react"
import { Provider } from "react-redux"
import { Route, Router } from "react-router"
import { MemoryHistory } from "history"

import EmptyArrayPage from "./pages/empty-array"
import NonEmptyArrayPage from "./pages/non-empty-array"
import ObjectWithNonEmptyStringPage from "./pages/object-with-non-empty-string"
import ObjectWithEmptyStringPage from "./pages/object-with-empty-string"
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
          path={"/empty-array"}
          exact
          render={routeProps => (
            <EmptyArrayPage {...routeProps} mockedMethods={mockedMethods} />
          )}
        />
        <Route
          path={"/non-empty-array"}
          exact
          render={routeProps => (
            <NonEmptyArrayPage {...routeProps} mockedMethods={mockedMethods} />
          )}
        />
        <Route
          path={"/object-with-non-empty-string"}
          exact
          render={routeProps => (
            <ObjectWithNonEmptyStringPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/object-with-empty-string"}
          exact
          render={routeProps => (
            <ObjectWithEmptyStringPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
      </Router>
    </Provider>
  </RenderControllerProvider>
)
