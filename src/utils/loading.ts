import { isEmpty } from "underscore"

import { getFullName } from "./general"
import { resetAttempted, areAttempted, setAttempted } from "./attempted"

import { LoadTarget } from "../.."

interface Loaders {
  [key: string]: () => void;
}

const loaders: Loaders = {}

interface TargetData {
  [key: string]: any;
}

const targetHasData = (target: LoadTarget): boolean => {
  const targetData: TargetData = {}
  const { data } = target

  Object.keys(data).forEach(key => {
    if (target.excluded && target.excluded.includes(key)) {
      return
    }
    targetData[key] = data[key]
  })

  return isEmpty(targetData) === false
}

export const checkTargetsLoaded = (targets: LoadTarget[]) =>
  targets.map(targetHasData).every(b => b === true)

const clearLoaders = () => {
  const keys = Object.keys(loaders)
  while (keys.length) {
    const k = keys.shift()
    if (k) {
      delete loaders[k]
    }
  }
}

const addLoader = (
  targetName: string,
  handler: () => void,
  callback: () => void
) => {
  var isLoadCancelled = false

  if (targetName in loaders) {
    return
  }

  loaders[targetName] = () => {
    delete loaders[targetName]
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
  while (keys.length) {
    const key = keys.shift()
    if (key) {
      loaders[key]()
    }
  }
}

const loadTarget = (controllerName: string, target: LoadTarget) => {
  //const fullName = getFullName(controllerName, target.name)

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
  setCanceller: (name: string, f?: () => void) => void,
  setControllerSeen: (bool: boolean) => void
) => {
  clearLoaders()

  const handleAttempt = (target: LoadTarget) => {
    setAttempted(controllerName, target.name)
    const result = areAttempted(controllerName, targets)
    setControllerSeen(result)
    if (result) {
      resetAttempted(controllerName)
    }
  }

  const prepareTarget = (target: LoadTarget) => {
    const fullName = getFullName(controllerName, target.name)
    const loadHandler = () => loadTarget(controllerName, target)
    const loadHandlerCallback = () => {
      setCanceller(fullName, undefined)
      handleAttempt(target)
    }
    const canceller = addLoader(fullName, loadHandler, loadHandlerCallback)
    setCanceller(fullName, canceller)
  }

  /**
   * Start adding each target loader to the list.
   */
  const arr = [...targets]
  while (arr.length) {
    const target = arr.shift()
    if (target) {
      prepareTarget(target)
    }
  }

  startRunningLoaders()
}
