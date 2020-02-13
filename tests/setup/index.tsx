import React from "react"
import { mount, ReactWrapper } from "enzyme"
import { createMemoryHistory, MemoryHistory } from "history"
import { Store } from "redux"

import { MockedMethods } from "tests/setup/app/types"

import App from "./app"
import createStore from "./app/store"

interface SetupReturnType {
  wrapper: ReactWrapper;
  store: Store;
  routerHistory: MemoryHistory;
}

export default (url = "/page-one", mocked: MockedMethods): SetupReturnType => {
  const routerHistory = createMemoryHistory({
    initialEntries: [url],
    initialIndex: 0,
  })
  const store = createStore(routerHistory)
  const wrapper = mount(
    <App routerHistory={routerHistory} store={store} mockedMethods={mocked} />
  )
  return {
    wrapper,
    store,
    routerHistory,
  }
}
