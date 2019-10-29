import _ from "underscore"

import {
  updateLoadCount,
} from "./counting"

const runDelayAmount = 1100

const loaders = {}
const getTotalLoaders = () => {
  return Object.keys(loaders).length
}

export const addLoader = ({ name, handler, callback }) => {
  var isLoadCancelled = false

  if (name in loaders) {
    return
  }

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

const startRunningLoaders = () => {
  Object.keys(loaders).forEach(key => {
    loaders[key]()
    delete loaders[key]
  })
}

export const runLoaders = _.debounce(totalLoaders => {
  const currentTotalLoaders = getTotalLoaders()
  var totalDelay = ((runDelayAmount * currentTotalLoaders) - runDelayAmount)
  if (totalDelay < 0) {
    totalDelay = 0
  }

  setTimeout(startRunningLoaders, totalDelay)
}, runDelayAmount)

