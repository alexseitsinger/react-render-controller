import React, { ReactElement } from "react"
import { Provider } from "react-redux"
import { Route, RouteProps } from "react-router"
import { ConnectedRouter } from "connected-react-router"
import { MemoryHistory } from "history"

import { RenderControllerProvider } from "src"
import { RenderControllerPathnames } from "src/RenderController"

import { FailedRender, FirstRender } from "../components"

import ArrayWithMixedStringsPage from "./pages/array-with-mixed-strings"
import ArrayWithMultipleEmptyStringsPage from "./pages/array-with-multiple-empty-strings"
import EmptyArrayPage from "./pages/empty-array"
import NonEmptyArrayPage from "./pages/non-empty-array"
import ObjectWithEmptyStringPage from "./pages/object-with-empty-string"
import ObjectWithExcludedFieldsPage from "./pages/object-with-excluded-fields"
import ObjectWithMixedStringsPage from "./pages/object-with-mixed-strings"
import ObjectWithNonEmptyStringPage from "./pages/object-with-non-empty-string"
import { StoreType } from "./store"

export interface Props {
  store: StoreType;
  routerHistory: MemoryHistory;
  mockedMethods: {
    [key: string]: () => void,
  };
}

const onRenderWithout = (): ReactElement => <FailedRender />
const onRenderFirst = (): ReactElement => <FirstRender />

export default ({
  store,
  routerHistory,
  mockedMethods,
}: Props): ReactElement => (
  <RenderControllerProvider
    onRenderWithout={onRenderWithout}
    onRenderFirst={onRenderFirst}
    getPathnames={(): RenderControllerPathnames => {
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
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithExcludedFieldsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/array-with-mixed-strings"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ArrayWithMixedStringsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/array-with-multiple-empty-strings"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ArrayWithMultipleEmptyStringsPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/empty-array"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <EmptyArrayPage {...routeProps} mockedMethods={mockedMethods} />
          )}
        />
        <Route
          path={"/non-empty-array"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <NonEmptyArrayPage {...routeProps} mockedMethods={mockedMethods} />
          )}
        />
        <Route
          path={"/object-with-non-empty-string"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithNonEmptyStringPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/object-with-empty-string"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithEmptyStringPage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/object-with-mixed-strings"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
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
