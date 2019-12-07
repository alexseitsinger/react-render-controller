import {
  getFullName,
  isDataEmpty,
} from "./general"
import {
  setCachedData,
  getCachedData,
  shouldBeCached,
} from "./cache"

const loaders = {}

export const doesTargetHaveData = target => {
  if (!target.data || isDataEmpty(target.data) === true) {
    return false
  }
  return true
}


export const checkTargetsLoaded = targets => (
  targets.map(target => doesTargetHaveData(target)).every(b => b === true)
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

  if (!(name in loaders)) {
    loaders[name] = () => {
      delete loaders[name]
      if (isLoadCancelled === true) {
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

  if (doesTargetHaveData(target) === true) {
    if (shouldBeCached(fullName, target) === true) {
      setCachedData(fullName, target.data)
    }
    return
  }

  const cached = getCachedData(fullName)
  if (isDataEmpty(cached) === false) {
    target.setter(cached)
    return
  }

  // getting new data
  target.getter(target.setter)
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

