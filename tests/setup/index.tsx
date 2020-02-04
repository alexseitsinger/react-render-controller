import React from "react"
import { mount, ReactWrapper } from "enzyme"
import { createMemoryHistory, MemoryHistory } from "history"
import { Store } from "redux"

import App from "./app"
import createStore from "./app/store"

interface SetupReturnType {
  wrapper: ReactWrapper;
  store: Store;
  serverHistory: MemoryHistory;
}

export default (url = "/page-one", mocked = {}): SetupReturnType => {
  const serverHistory = createMemoryHistory({
    initialEntries: [url],
    initialIndex: 0,
  })
  const store = createStore(serverHistory)
  const wrapper = mount(
    <App routerHistory={serverHistory} store={store} mockedMethods={mocked} />
  )
  return {
    wrapper,
    store,
    serverHistory,
  }
}
