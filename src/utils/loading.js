import {
  debounce,
  once,
  isFunction,
} from "underscore"

import {
  getFullName,
  isEmpty,
} from "./general"
import {
  getLoadCount,
  updateLoadCount,
  resetLoadCount,
} from "./counting"

const runLoadersDelay = 1100

const loaders = {}

const cachedData = {}
const setCachedData = (fullName, data) => {
  cachedData[fullName] = {
    date: (new Date(Date.now()).toISOString()),
    data: data,
  }
}
const getCachedData = fullName => {
  if (fullName in cachedData) {
    return cachedData[fullName].data
  }
}

const shouldDataBeCached = (fullName, target) => {
  if (doesTargetHaveData(target) === true) {
    if (target.cache && target.cache === true) {
      // check data expiration here.
      if (!(fullName in cachedData)) {
        consle.log("shouldDataBeCached: true", fullName)
        return true
      }
      // if expired -> true
    }
  }
  console.log("shouldDataBeCached: false", fullName)
  return false
}

export const doesTargetHaveData = target => {
  if (!target.data || isEmpty(target.data) === true) {
    return false
  }
  return true
}


export const checkTargetsLoaded = targets => (
  targets.map(target => doesTargetHaveData(target)).every(b => b === true)
)


export const clearLoaders = () => {
  console.log("clearing loaders...")
  const keys = Object.keys(loaders)
  var k
  while (keys.length) {
    k = keys.shift()
    delete loaders[k]
  }
}

export const addLoader = (name, handler, callback) => {
  var isLoadCancelled = false

  if (!(name in loaders)) {
    loaders[name] = () => {
      console.log("Running method....")
      delete loaders[name]
      if (isLoadCancelled === true) {
        console.log("Method cancelled...")
        return
      }
      handler()
      callback()
    }
  }

  return () => {
    isLoadCancelled = true
  }
}

export const startRunningLoaders = () => {
  console.log("running loaders")
  const keys = Object.keys(loaders)
  var k
  while (keys.length) {
    k = keys.shift()
    loaders[k]()
  }
}

const loadTarget = (controllerName, target) => {
  const fullName = getFullName(controllerName, target.name)

  console.log(`loadTarget() (${target.name})`)

  if (doesTargetHaveData(target) === true) {
    console.log(`doesTargetHaveData: true (${target.name})`)
    if (shouldDataBeCached(fullName, target) === true) {
      console.log(`shouldDataBeCached:  true`)
      setCachedData(fullName, target.data)
    }
    return
  }

  const cached = getCachedData(fullName)
  if (cached) {
    console.log("setting cached data instead of getting")
    target.setter(cached)
    return
  }

  // getting new data
  console.log("getting new data")
  target.getter(target.setter)
}

export const startLoading = (controllerName, targets, setCanceller) => {
  const prepareTarget = target => {
    const fullName = getFullName(controllerName, target.name)
    const loadHandler = () => loadTarget(controllerName, target)
    const loadHandlerCallback = () => setCanceller(fullName, null)
    const canceller = addLoader(fullName, loadHandler, loadHandlerCallback)
    setCanceller(fullName, canceller)
  }

  /**
   * Start adding each target loader to the list.
   */
  const arr = [...targets]
  var t
  while (arr.length) {
    t = arr.shift()
    prepareTarget(t)
  }

  startRunningLoaders()
}

