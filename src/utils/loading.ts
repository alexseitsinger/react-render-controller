import { isArray, isEqual, isObject } from "underscore"

import { RenderControllerTarget } from "src/RenderController"
import {
  hasTargetAttemptedLoading,
  haveTargetsAttemptedLoading,
  updateLoadCount,
} from "src/utils/counting"
import { getControllerTargetName, hasValue } from "src/utils/general"

import { FunctionType } from "../types"

import { loadingMessage } from "./debug"

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
    loadingMessage({
      text: `Does target '${target.name}' have data?: ${result}`,
      level: 2,
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
    loadingMessage({
      text: `Does target '${target.name}' have data? ${result}`,
      level: 2,
    })
    return result
  }

  const result = hasValue(data)
  loadingMessage({
    text: `Does target '${target.name}' have data? ${result}`,
    level: 2,
  })
  return result
}

export function assertTargetsHaveData(
  targets: RenderControllerTarget[]
): boolean {
  const result = targets.map(assertTargetHasData).every(b => b === true)
  loadingMessage({
    text: `Do all ${targets.length} target(s) have data? ${result}`,
    level: 2,
  })
  return result
}

const clearOldLoaders = (): void => {
  const keys = Object.keys(loaders)
  loadingMessage({
    text: `Clearing ${keys.length} loaders`,
    level: 1,
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
    loadingMessage({
      text: `A loader already exists for target '${targetName}'`,
      level: 3,
    })
    return
  }

  if (hasTargetAttemptedLoading(targetName)) {
    loadingMessage({
      text: `Target '${targetName}' has already attempted loading.`,
      level: 3,
    })
    return
  }

  loadingMessage({
    text: `Adding a loader for target '${targetName}'`,
    level: 1,
  })

  loaders[targetName] = (): void => {
    delete loaders[targetName]
    if (isLoadCancelled) {
      loadingMessage({
        text: `Loading was cancelled for ${targetName}`,
        level: 3,
      })
      return
    }
    loadingMessage({
      text: `Running loader for target '${targetName}'`,
      level: 1,
    })
    loadDataForTarget(target, targetName)
    callback()
  }

  return (): void => {
    loadingMessage({
      text: `Cancelling loader for target '${targetName}'`,
      level: 1,
    })
    isLoadCancelled = true
  }
}

const startRunningLoaders = (): void => {
  const keys = Object.keys(loaders)
  loadingMessage({
    text: `Running ${keys.length} loaders`,
    level: 1,
  })
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
  if (assertTargetHasData(target)) {
    loadingMessage({
      text: `Target '${target.name}' already has data.`,
      level: 3,
    })
    if (target.forced !== undefined && target.forced === true) {
      if (target.attempted !== undefined) {
        loadingMessage({
          text: `Loading is forced for target '${targetName}', so running getter`,
          level: 3,
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
        loadingMessage({
          text: `Recording data for target '${targetName}' for future resets`,
          level: 3,
        })
        records[targetName] = target.data
      }
      if (!isEqual(records[targetName], target.data)) {
        loadingMessage({
          text: `Re-setting previous data for target '${targetName}'`,
          level: 3,
        })
        records[targetName] = target.data
        target.setter(target.data)
      }
    }

    return
  }

  loadingMessage({
    text: `Getting data for target '${targetName}'`,
    level: 1,
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
