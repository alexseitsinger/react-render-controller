import _ from "underscore"

import { updateLoadCount } from "./counting"

const loaders = {}

export const addLoader = (name, load, callback) => {
  var isLoadCancelled = false

  loaders[name] = () => {
    if (isLoadCancelled === true) {
      delete loaders[name]
      return
    }
    load()
    updateLoadCount(name)
    callback()
    delete loaders[name]
  }

  return () => {
    isLoadCancelled = true
  }
}

export const runLoaders = _.debounce((from, to) => {
  Object.keys(loaders).forEach(name => {
    loaders[name]()
  })
}, 2500)



