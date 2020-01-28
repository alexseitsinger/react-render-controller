import React from "react"
import { mount } from "enzyme"
import { createMemoryHistory } from "history"

import createStore from "./app/store"
import App from "./app"

export default (url = "/page-one", mocked = {}) => {
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
