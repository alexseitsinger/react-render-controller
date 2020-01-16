import React from "react"
import { mount } from "enzyme"
import { createMemoryHistory } from "history"

import createStore from "./app/store"
import App from "./app"

export default (url = "/page-a", mockedMethods?: object) => {
  const memoryHistory = createMemoryHistory({
    initialEntries: [url],
    initialIndex: 0,
  })
  const store = createStore(memoryHistory)
  const wrapper = mount(
    <App memoryHistory={memoryHistory} store={store} mocked={mockedMethods} />
  )
  return {
    wrapper,
    store,
    memoryHistory,
  }
}
