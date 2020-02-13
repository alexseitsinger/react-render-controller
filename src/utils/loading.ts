import { isArray, isObject } from "underscore"

import { RenderControllerTarget } from "src/RenderController"
import {
  haveTargetsAttemptedLoading,
  updateLoadCount,
} from "src/utils/counting"
import { getControllerTargetName, hasValue } from "src/utils/general"

import { FunctionType } from "../types"

import { debugMessage } from "./debug"

interface Loaders {
  [key: string]: FunctionType;
}

const loaders: Loaders = {}

function assertTargetHasData(target: RenderControllerTarget): boolean {
  const excluded = isArray(target.excluded) ? target.excluded : []
  const { data } = target

  if (isArray(data)) {
    const result = hasValue(data.filter(s => excluded.includes(s) === false))
    debugMessage(`Is target '${target.name}' loaded?: ${result}`)
    return result
  }
  if (isObject(data)) {
    const newData = {
      ...data,
    }

    Object.keys(data).forEach(key => {
      if (excluded.includes(key)) {
        delete newData[key]
      }
    })

    const result = hasValue(newData)
    debugMessage(`Is target '${target.name}' loaded? ${result}`)
    return result
  }

  const result = hasValue(data)
  debugMessage(`Is target '${target.name}' loaded? ${result}`)
  return result
}

export function assertTargetsHaveData(
  targets: RenderControllerTarget[]
): boolean {
  const result = targets.map(assertTargetHasData).every(b => b === true)
  debugMessage(`Are all ${targets.length} targets received data? ${result}`)
  return result
}

const clearOldLoaders = (): void => {
  const keys = Object.keys(loaders)
  debugMessage(`Clearing ${keys.length} loaders`)
  while (keys.length > 0) {
    const k = keys.shift()
    if (k !== undefined) {
      delete loaders[k]
    }
  }
}

function addLoader(
  controllerName: string,
  target: RenderControllerTarget,
  targets: RenderControllerTarget[],
  setControllerSeen: () => void
): (() => void) | undefined {
  let isLoadCancelled = false

  const targetName = getControllerTargetName({
    controllerName,
    target,
  })

  if (targetName in loaders) {
    debugMessage(`A loader already exists for target '${targetName}'`)
    return
  }

  debugMessage(`Adding a loader for target '${targetName}'`)

  loaders[targetName] = (): void => {
    delete loaders[targetName]
    if (isLoadCancelled) {
      debugMessage(`Loading was cancelled for ${targetName}`)
      return
    }
    debugMessage(`Loading target '${targetName}'`)
    loadDataForTarget(target)
    updateLoadCount(targetName)
    const isAttempted = haveTargetsAttemptedLoading(controllerName, targets)
    if (isAttempted) {
      setControllerSeen()
    }
  }

  return (): void => {
    debugMessage(`Cancelling load for ${targetName}`)
    isLoadCancelled = true
  }
}

const startRunningLoaders = (): void => {
  const keys = Object.keys(loaders)
  debugMessage(`Running ${keys.length} loaders`)
  while (keys.length > 0) {
    const key = keys.shift()
    if (key !== undefined) {
      loaders[key]()
    }
  }
}

function loadDataForTarget(target: RenderControllerTarget): void {
  debugMessage(`Attempting to load target '${target.name}'`)

  if (assertTargetHasData(target)) {
    debugMessage(`Target '${target.name}' already has data loaded`)
    if (target.forced !== undefined && target.forced === true) {
      if (target.attempted !== undefined) {
        debugMessage(
          `Loading is forced for target '${target.name}', so running getter`
        )
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
    debugMessage(`Re-setting previous data for target '${target.name}'`)
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
  debugMessage(`Getting fresh data for target '${target.name}'`)
  target.getter()
}

interface StartLoadingArgs {
  targets: RenderControllerTarget[];
  controllerName: string;
  setCanceller: (f: () => void) => void;
  setControllerSeen: () => void;
}

export const startLoading = ({
  controllerName,
  targets,
  setCanceller,
  setControllerSeen,
}: StartLoadingArgs): void => {
  debugMessage(
    `Starting loading for controller '${controllerName}' with ${targets.length} targets`
  )
  clearOldLoaders()

  const addNewLoader = (target: RenderControllerTarget): void => {
    const canceller = addLoader(
      controllerName,
      target,
      targets,
      setControllerSeen
    )
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
      addNewLoader(target)
    }
  }

  startRunningLoaders()
}
