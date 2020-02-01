import React from "react"
import { Provider } from "react-redux"
import { Route } from "react-router"
import { MemoryHistory } from "history"
import { ConnectedRouter } from "connected-react-router"

import ArrayWithMultipleEmptyStringsPage from "./pages/array-with-multiple-empty-strings"
import ArrayWithMixedStringsPage from "./pages/array-with-mixed-strings"
import EmptyArrayPage from "./pages/empty-array"
import NonEmptyArrayPage from "./pages/non-empty-array"
import ObjectWithNonEmptyStringPage from "./pages/object-with-non-empty-string"
import ObjectWithEmptyStringPage from "./pages/object-with-empty-string"
import ObjectWithMixedStringsPage from "./pages/object-with-mixed-strings"
import ObjectWithExcludedFieldsPage from "./pages/object-with-excluded-fields"
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

const onRenderWithout = () => <FailedRender />
const onRenderFirst = () => <FirstRender />

export default ({ store, routerHistory, mockedMethods }: Props) => (
  <RenderControllerProvider
    onRenderWithout={onRenderWithout}
    onRenderFirst={onRenderFirst}
    getPathnames={() => {
      const state = store.getState()
      const { current, last } = state.locations
      return {
        lastPathname: last.pathname,
        currentPathname: current.pathname,
      }
    }}>
    <Provider store={store}>
      <ConnectedRouter history={routerHistory}>
        <Route
          path={"/object-with-excluded-fields"}
          exact
          render={routeProps => (
            <ObjectWithExcludedFieldsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/array-with-mixed-strings"}
          exact
          render={routeProps => (
            <ArrayWithMixedStringsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/array-with-multiple-empty-strings"}
          exact
          render={routeProps => (
            <ArrayWithMultipleEmptyStringsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
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
        <Route
          path={"/object-with-mixed-strings"}
          exact
          render={routeProps => (
            <ObjectWithMixedStringsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
      </ConnectedRouter>
    </Provider>
  </RenderControllerProvider>
)
