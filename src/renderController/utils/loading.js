import _ from "underscore"

import {
  updateLoadCount,
} from "./counting"

export const runLoadersDelay = 1100

export const loaders = {}

let kickedOff = []
const clearKickedOff = _.debounce(() => {
  kickedOff = []
}, 3000)

export const kickoff = (name, f) => {
  const i = kickedOff.indexOf(name)
  if (i < 0) {
    kickedOff.push(name)
    f()
  }
}

export const addLoader = (name, handler, callback) => {
  var isLoadCancelled = false

  if (!(name in loaders)) {
    loaders[name] = _.once(() => {
      delete loaders[name]
      if (isLoadCancelled === true) {
        return
      }
      handler()
      updateLoadCount(name)
      callback()
    })
  }

  return () => {
    isLoadCancelled = true
  }
}

export const startRunningLoaders = () => {
  Object.keys(loaders).forEach(key => {
    loaders[key]()
  })
}

export const runLoaders = _.debounce(() => {
  const totalLoaders = Object.keys(loaders).length
  var totalDelay = ((runLoadersDelay * totalLoaders) - runLoadersDelay)
  if (totalDelay < 0) {
    totalDelay = 0
  }

  setTimeout(startRunningLoaders, totalDelay)
}, runLoadersDelay)

