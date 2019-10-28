import React from "react"
import { Provider, connect } from "react-redux"
import { createMemoryHistory } from "history"

import { Component } from "./component"
import { mapDispatch } from "./mapDispatch"
import { mapState } from "./mapState"
import { createStore } from "./store"

const initialState = {}
const history = createMemoryHistory({
  initialEntries: ["/"],
  initialIndex: 0,
})

const store = createStore(history, initialState)
const ConnectedComponent = connect(mapState, mapDispatch)(Component)

export const setupTestOne = () => (
  <Provider store={store}>
    <ConnectedComponent />
  </Provider>
)
