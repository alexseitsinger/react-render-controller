import { isEmpty } from "underscore"

import { LoadTarget } from "../.."

import { getFullName } from "./general"

const loaders = {}

const targetHasData = (target: LoadTarget): boolean => {
  const targetData = {
    ...target.data,
  }

  if (target.excluded) {
    target.excluded.forEach((name: string) => {
      delete targetData[name]
    })
  }

  return isEmpty(targetData) === false
}

export const checkTargetsLoaded = (targets: LoadTarget[]) => targets.map(targetHasData).every(b => b === true)

const clearLoaders = () => {
  const keys = Object.keys(loaders)
  var k
  while (keys.length) {
    k = keys.shift()
    delete loaders[k]
  }
}

const addLoader = (name: string, handler: () => void, callback: () => void) => {
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

const loadTarget = (controllerName: string, target: LoadTarget) => {
  const fullName = getFullName(controllerName, target.name)

  if (targetHasData(target) === true) {
    if (target.forced && target.forced === true) {
      if (!target.attempted) {
        target.attempted = true
        target.getter()
        return
      }
    }
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

  //
  // if (doesTargetHaveData(target) === true) {
  // if (shouldBeCached(fullName, target) === true) {
  //     setCachedData(fullName, target.data)
  // }
  // }
  //
  // const cached = getCachedData(fullName)
  // if (isDataEmpty(cached) === false) {
  // target.setter(cached)
  // return
  // }
  //
  target.getter()
}

export const startLoading = (
  controllerName: string,
  targets: LoadTarget[],
  setCanceller: (name: string, f?: () => void) => void
) => {
  clearLoaders()

  const prepareTarget = (target: LoadTarget) => {
    const fullName = getFullName(controllerName, target.name)
    const loadHandler = () => loadTarget(controllerName, target)
    const loadHandlerCallback = () => setCanceller(fullName, undefined)
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
