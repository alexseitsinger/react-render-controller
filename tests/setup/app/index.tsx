import React, { ReactElement } from "react"
import { Provider } from "react-redux"
import { Route, RouteProps } from "react-router"
import { ConnectedRouter } from "connected-react-router"
import { MemoryHistory } from "history"

import { RenderControllerProvider } from "src"
import { RenderControllerPathnames } from "src/RenderController"
import { MockedMethods } from "tests/setup/app/types"

import { FailedRender, FirstRender } from "../components"

import ArrayWithMixedStringsPage from "./pages/array-with-mixed-strings"
import ArrayWithMultipleEmptyStringsPage from "./pages/array-with-multiple-empty-strings"
import EmptyArrayPage from "./pages/empty-array"
import NonEmptyArrayPage from "./pages/non-empty-array"
import ObjectWithEmptyStringPage from "./pages/object-with-empty-string"
import ObjectWithExcludedFieldsPage from "./pages/object-with-excluded-fields"
import ObjectWithMixedStringsPage from "./pages/object-with-mixed-strings"
import ObjectWithNonEmptyStringPage from "./pages/object-with-non-empty-string"
import SiblingPropChangePage from "./pages/sibling-prop-change"
import { StoreType } from "./store"

export interface AppProps {
  store: StoreType;
  routerHistory: MemoryHistory;
  mockedMethods: MockedMethods;
}

const onRenderWithout = (): ReactElement => <FailedRender />
const onRenderFirst = (): ReactElement => <FirstRender />

export default ({
  store,
  routerHistory,
  mockedMethods,
}: AppProps): ReactElement => (
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
          path={"/sibling-prop-change"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <SiblingPropChangePage
              {...routeProps}
              mockedMethods={mockedMethods}
            />
          )}
        />
        <Route
          path={"/object-with-excluded-fields"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithExcludedFieldsPage {...routeProps} />
          )}
        />
        <Route
          path={"/array-with-mixed-strings"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ArrayWithMixedStringsPage {...routeProps} />
          )}
        />
        <Route
          path={"/array-with-multiple-empty-strings"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ArrayWithMultipleEmptyStringsPage {...routeProps} />
          )}
        />
        <Route
          path={"/empty-array"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <EmptyArrayPage {...routeProps} />
          )}
        />
        <Route
          path={"/non-empty-array"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <NonEmptyArrayPage {...routeProps} />
          )}
        />
        <Route
          path={"/object-with-non-empty-string"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithNonEmptyStringPage {...routeProps} />
          )}
        />
        <Route
          path={"/object-with-empty-string"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithEmptyStringPage {...routeProps} />
          )}
        />
        <Route
          path={"/object-with-mixed-strings"}
          exact
          render={(routeProps: RouteProps): ReactElement => (
            <ObjectWithMixedStringsPage {...routeProps} />
          )}
        />
      </ConnectedRouter>
    </Provider>
  </RenderControllerProvider>
)
