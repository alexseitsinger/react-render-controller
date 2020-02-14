import { isArray, isEmpty, isEqual, isObject } from "underscore"

import { RenderControllerTarget } from "src/RenderController"
import {
  hasTargetAttemptedLoading,
  haveTargetsAttemptedLoading,
  updateLoadCount,
} from "src/utils/counting"
import { getControllerTargetName, hasValue } from "src/utils/general"

import { FunctionType } from "../types"

import { debugMessage } from "./debug"

const sectionName = "loading"

// Save copies of the loaded data, each time, so we can easilly check if its
// changed or not.
interface Records {
  [key: string]: any;
}

const records: Records = {}

interface Loaders {
  [key: string]: FunctionType;
}

const loaders: Loaders = {}

function assertTargetHasData(target: RenderControllerTarget): boolean {
  const excluded = isArray(target.excluded) ? target.excluded : []
  const { data } = target

  if (isArray(data)) {
    const result = hasValue(data.filter(s => excluded.includes(s) === false))
    debugMessage({
      message: `Does target '${target.name}' have data?: ${result}`,
      sectionName,
    })
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
    debugMessage({
      message: `Does target '${target.name}' have data? ${result}`,
      sectionName,
    })
    return result
  }

  const result = hasValue(data)
  debugMessage({
    message: `Does target '${target.name}' have data? ${result}`,
    sectionName,
  })
  return result
}

export function assertTargetsHaveData(
  targets: RenderControllerTarget[]
): boolean {
  const result = targets.map(assertTargetHasData).every(b => b === true)
  debugMessage({
    message: `Do all ${targets.length} target(s) have data? ${result}`,
    sectionName,
  })
  return result
}

const clearOldLoaders = (): void => {
  const keys = Object.keys(loaders)
  debugMessage({
    message: `Clearing ${keys.length} loaders`,
    sectionName,
  })
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
  callback: () => void
): (() => void) | undefined {
  let isLoadCancelled = false

  const targetName = getControllerTargetName({
    controllerName,
    target,
  })

  if (targetName in loaders) {
    debugMessage({
      message: `A loader already exists for target '${targetName}'`,
      sectionName,
    })
    return
  }

  if (hasTargetAttemptedLoading(targetName)) {
    debugMessage({
      message: `Target '${targetName}' has already attempted loading.`,
      sectionName,
    })
    return
  }

  debugMessage({
    message: `Adding a loader for target '${targetName}'`,
    sectionName,
  })

  loaders[targetName] = (): void => {
    delete loaders[targetName]
    if (isLoadCancelled) {
      debugMessage({
        message: `Loading was cancelled for ${targetName}`,
        sectionName,
      })
      return
    }
    debugMessage({ message: `Loading target '${targetName}'`, sectionName })
    loadDataForTarget(target, targetName)
    callback()
  }

  return (): void => {
    debugMessage({ message: `Cancelling load for ${targetName}`, sectionName })
    isLoadCancelled = true
  }
}

const startRunningLoaders = (): void => {
  const keys = Object.keys(loaders)
  debugMessage({ message: `Running ${keys.length} loaders`, sectionName })
  while (keys.length > 0) {
    const key = keys.shift()
    if (key !== undefined) {
      loaders[key]()
    }
  }
}

function loadDataForTarget(
  target: RenderControllerTarget,
  targetName: string
): void {
  debugMessage({
    message: `Attempting to load target '${targetName}'`,
    sectionName,
  })

  if (assertTargetHasData(target)) {
    debugMessage({
      message: `Target '${target.name}' already has data loaded.`,
      sectionName,
    })
    if (target.forced !== undefined && target.forced === true) {
      if (target.attempted !== undefined) {
        debugMessage({
          message: `Loading is forced for target '${targetName}', so running getter`,
          sectionName,
        })
        target.attempted = true
        target.getter()
        return
      }
    }

    /**
     * If we are re-using state across multiple RenderControllers, that state
     * may be changed after the reference to the data is passed here. When this
     * ahppens, it thinks the data exists in the redux store, but it actually
     * doesn't. Therefore, to avoid this problem, when data passed is non-empty
     * re-set it to the store using the setter.
     */
    if (hasValue(target.data)) {
      if (!(targetName in records)) {
        debugMessage({
          message: `Recording data for target '${targetName}' for future resets`,
          sectionName,
        })
        records[targetName] = target.data
      }
      if (!isEqual(records[targetName], target.data)) {
        debugMessage({
          message: `Re-setting previous data for target '${targetName}'`,
          sectionName,
        })
        records[targetName] = target.data
        target.setter(target.data)
      }
    }

    return
  }

  debugMessage({
    message: `Getting fresh data for target '${targetName}'`,
    sectionName,
  })

  target.getter()

  updateLoadCount(targetName)
}

interface StartLoadingArgs {
  targets: RenderControllerTarget[];
  controllerName: string;
  addCanceller: (f: () => void) => void;
  setControllerCompleted: () => void;
}

export const startLoading = ({
  controllerName,
  targets,
  addCanceller,
  setControllerCompleted,
}: StartLoadingArgs): void => {
  debugMessage({
    message: `Starting loading for controller '${controllerName}' with ${targets.length} targets`,
    sectionName,
  })
  clearOldLoaders()

  const addNewLoader = (target: RenderControllerTarget): void => {
    const callback = (): void => {
      const isAttempted = haveTargetsAttemptedLoading(controllerName, targets)
      if (isAttempted) {
        setControllerCompleted()
      }
    }
    const canceller = addLoader(controllerName, target, callback)
    if (canceller !== undefined) {
      addCanceller(canceller)
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
