import _ from "underscore"

import {
  updateLoadCount,
} from "./counting"

export const runLoadersDelay = 1100

export const loaders = {}

export const getTotalLoaders = currentPathname => {
  if (!(currentPathname in loaders)) {
    loaders[currentPathname] = {}
  }
  const fns = loaders[currentPathname]
  return Object.keys(fns).length
}

export const addLoader = ({ currentPathname, name, handler, callback }) => {
  var isLoadCancelled = false

  if (!(currentPathname in loaders)) {
    loaders[currentPathname] = {}
  }
  const fns = loaders[currentPathname]

  fns[name] = () => {
    delete fns[name]
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

export const startRunningLoaders = currentPathname => {
  if (!(currentPathname in loaders)) {
    loaders[currentPathname] = {}
  }
  const fns = loaders[currentPathname]

  Object.keys(fns).forEach(key => {
    fns[key]()
    delete fns[key]
  })
}

export const runLoaders = _.debounce((currentPathname) => {
  const currentTotalLoaders = getTotalLoaders(currentPathname)

  var totalDelay = ((runLoadersDelay * currentTotalLoaders) - runLoadersDelay)
  if (totalDelay < 0) {
    totalDelay = 0
  }

  setTimeout(() => {
    startRunningLoaders(currentPathname)
  }, totalDelay)
}, runLoadersDelay)

