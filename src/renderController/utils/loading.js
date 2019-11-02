import _ from "underscore"

import {
  updateLoadCount,
} from "./counting"

export const runLoadersDelay = 1100

export const loaders = {}

export const getTotalLoaders = () => {
  return Object.keys(loaders).length
}

export const addLoader = ({ name, handler, callback }) => {
  var isLoadCancelled = false

  loaders[name] = () => {
    delete loaders[name]
    if (isLoadCancelled === true) {
      return
    }
    handler()
    updateLoadCount(name)
    callback()
  }

  return () => {
    isLoadCancelled = true
  }
}

export const startRunningLoaders = () => {
  Object.keys(loaders).forEach(key => {
    loaders[key]()
    delete loaders[key]
  })
}

export const runLoaders = _.debounce(totalLoaders => {
  const currentTotalLoaders = getTotalLoaders()
  var totalDelay = ((runLoadersDelay * currentTotalLoaders) - runLoadersDelay)
  if (totalDelay < 0) {
    totalDelay = 0
  }

  setTimeout(startRunningLoaders, totalDelay)
}, runLoadersDelay)

