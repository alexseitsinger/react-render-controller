import React from "react"
import { createMemoryHistory } from "history"

import createStore from "./app/store"
import App from "./app"

export default (url="/page-a", mockedMethods) => {
  const history = createMemoryHistory({
    initialEntries: [url],
    initialIndex: 0,
  })
  const store = createStore(history)
  const wrapper = mount(
    <App
      history={history}
      store={store}
      mocked={mockedMethods}
    />
  )
  return {
    wrapper,
    store,
    history,
  }
}
