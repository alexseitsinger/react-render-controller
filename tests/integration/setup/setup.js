import React from "react"
import { createMemoryHistory } from "history"

import { createStore } from "./store"
import { App } from "./app"

export const setup = (initialState = {}, initialEntries = ["/page-a"]) => {
  const history = createMemoryHistory({
    initialEntries: initialEntries,
    initialIndex: 0,
  })
  const store = createStore(history, initialState)
  return mount(<App history={history} store={store} />)
}
