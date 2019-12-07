import { isEmpty } from "underscore"

import {
  getFullName,
} from "./general"
import {
  setCachedData,
  getCachedData,
  shouldBeCached,
} from "./cache"

const loaders = {}

const targetHasData = obj => (isEmpty(obj) === false)

export const checkTargetsLoaded = targets => (
  targets.map(target => targetHasData(target.data)).every(b => b === true)
)


const clearLoaders = () => {
  const keys = Object.keys(loaders)
  var k
  while (keys.length) {
    k = keys.shift()
    delete loaders[k]
  }
}

const addLoader = (name, handler, callback) => {
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
    callback()
  }

  return () => {
    isLoadCancelled = true
  }
}

const startRunningLoaders = () => {
  const keys = Object.keys(loaders)
  var k
  while (keys.length) {
    k = keys.shift()
    loaders[k]()
  }
}

const loadTarget = (controllerName, target) => {
  const fullName = getFullName(controllerName, target.name)

  if (targetHasData(target.data) === true) {
    /**
     * If we are re-using state across multiple RenderControllers, that state
     * may be changed after the reference to the data is passed here. When this
     * ahppens, it thinks the data exists in the redux store, but it actually
     * doesn't. Therefore, to avoid this problem, when data exists already,
     * re-set it using the setter.
     */
    target.setter(target.data)
    return
  }

  /*
  if (doesTargetHaveData(target) === true) {
    if (shouldBeCached(fullName, target) === true) {
      setCachedData(fullName, target.data)
    }
  }

  const cached = getCachedData(fullName)
  if (isDataEmpty(cached) === false) {
    target.setter(cached)
    return
  }
  */
  target.getter()
}

export const startLoading = (controllerName, targets, setCanceller) => {
  clearLoaders()

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

