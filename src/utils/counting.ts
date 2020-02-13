import { RenderControllerTarget } from "src/RenderController"
import { debugMessage } from "src/utils/debug"

import { getControllerTargetName } from "./general"

const sectionName = "counting"

interface LoadCounts {
  [key: string]: number;
}

const loadCounts: LoadCounts = {}
export function resetLoadCount(targetName: string): number {
  debugMessage({
    message: `Resetting load count for target '${targetName}'`,
    sectionName,
  })
  loadCounts[targetName] = 0
  return getLoadCount(targetName)
}

export function getLoadCount(targetName: string): number {
  if (!(targetName in loadCounts)) {
    resetLoadCount(targetName)
  }
  const result = loadCounts[targetName]
  debugMessage({
    message: `Load count for target '${targetName}': ${result}`,
    sectionName,
  })
  return result
}

export function updateLoadCount(targetName: string): number {
  if (!(targetName in loadCounts)) {
    resetLoadCount(targetName)
  }
  loadCounts[targetName] += 1
  return getLoadCount(targetName)
}

export function totalTargetsAttemptedLoading(
  controllerName: string,
  targets: RenderControllerTarget[]
): number {
  return targets
    .map((target: RenderControllerTarget): number => {
      return getLoadCount(
        getControllerTargetName({
          controllerName,
          target,
        })
      )
    })
    .reduce((a: number, b: number): number => a + b, 0)
}

export function assertFirstLoad(
  controllerName: string,
  targets: RenderControllerTarget[]
): boolean {
  const result = totalTargetsAttemptedLoading(controllerName, targets) === 0
  debugMessage({
    message: `Is first load for controller '${controllerName}' with ${targets.length} targets? ${result}`,
    sectionName,
  })
  return result
}

export function haveTargetsAttemptedLoading(
  controllerName: string,
  targets: RenderControllerTarget[]
): boolean {
  const total = totalTargetsAttemptedLoading(controllerName, targets)
  const result = total >= targets.length
  debugMessage({
    message: `Have all of ${controllerName}'s ${targets.length} targets attempted loading? ${result}`,
    sectionName,
  })
  return result
}

export function hasTargetAttemptedLoading(targetName: string): boolean {
  const result = getLoadCount(targetName) > 0
  debugMessage({
    message: `Has target '${targetName}' attempted loading? ${result}`,
    sectionName,
  })
  return result
}
