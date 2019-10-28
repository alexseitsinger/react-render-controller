import _ from "underscore"

import { updateLoadCount } from "./counting"
import {
  runDelayAmount,
} from "./delays"

const loaders = {}
const getTotalLoaders = () => {
  return Object.keys(loaders).length
}

var loaderMethods = []
export const resetLoaderMethods = _.debounce(() => {
  loaderMethods = []
}, 15000)

export const doesLoaderMethodExist = f => {
  return loaderMethods.map(fn => fn === f).includes(true)
}
export const rememberLoaderMethod = f => {
  if (doesLoaderMethodExist(f) === false) {
    loaderMethods.push(f)
  }
}

export const addLoader = ({ name, handler, method, callback }) => {
  var isLoadCancelled = false

  if (doesLoaderMethodExist(method) === true) {
    return
  }
  if (name in loaders) {
    return
  }

  rememberLoaderMethod(method)

  loaders[name] = () => {
    if (isLoadCancelled === true) {
      delete loaders[name]
      return
    }
    handler()
    updateLoadCount(name)
    callback()
    delete loaders[name]
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

