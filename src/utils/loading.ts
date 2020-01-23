import { isEmpty, isString } from "underscore"

import { Loaders, LoadTarget } from "../types"

import { areAttempted, resetAttempted, setAttempted } from "./attempted"
import { getFullName } from "./general"

const loaders: Loaders = {}

const targetHasData = (target: LoadTarget): boolean => {
  const { data } = target
  return Object.keys(data)
    .map(key => {
      if (isString(data[key])) {
        return data[key].length > 0
      }
      return isEmpty(data[key]) === false
    })
    .every((r: boolean) => r === true)
}

export const checkTargetsLoaded = (targets: LoadTarget[]): boolean =>
  targets.map(targetHasData).every(b => b === true)

const clearLoaders = (): void => {
  const keys = Object.keys(loaders)
  while (keys.length > 0) {
    const k = keys.shift()
    if (k !== undefined) {
      delete loaders[k]
    }
  }
}

const addLoader = (
  targetName: string,
  handler: () => void,
  callback: () => void
): (() => void) | undefined => {
  var isLoadCancelled = false

  if (targetName in loaders) {
    return
  }

  loaders[targetName] = (): void => {
    delete loaders[targetName]
    if (isLoadCancelled === true) {
      return
    }
    handler()
    callback()
  }

  return (): void => {
    isLoadCancelled = true
  }
}

const startRunningLoaders = (): void => {
  const keys = Object.keys(loaders)
  while (keys.length > 0) {
    const key = keys.shift()
    if (key !== undefined) {
      loaders[key]()
    }
  }
}

const loadTarget = (target: LoadTarget): void => {
  if (targetHasData(target) === true) {
    if (target.forced !== undefined && target.forced === true) {
      if (target.attempted !== undefined) {
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

interface StartLoadingArgs {
  controllerName: string;
  targets: LoadTarget[];
  setCanceller: (f: () => void) => void;
  setControllerSeen: () => void;
}

export const startLoading = ({
  controllerName,
  targets,
  setCanceller,
  setControllerSeen,
}: StartLoadingArgs): void => {
  clearLoaders()

  const prepareTarget = (target: LoadTarget): void => {
    const fullName = getFullName(controllerName, target.name)
    const loadHandler = (): void => {
      loadTarget(target)
    }
    const loadHandlerCallback = (): void => {
      setAttempted(controllerName, target.name)
      const result = areAttempted(controllerName, targets)
      if (result) {
        setControllerSeen()
        resetAttempted(controllerName)
      }
    }
    const canceller = addLoader(fullName, loadHandler, loadHandlerCallback)
    if (canceller !== undefined) {
      setCanceller(canceller)
    }
  }

  /**
   * Start adding each target loader to the list.
   */
  const arr = [...targets]
  while (arr.length > 0) {
    const target = arr.shift()
    if (target !== undefined) {
      prepareTarget(target)
    }
  }

  startRunningLoaders()
}
