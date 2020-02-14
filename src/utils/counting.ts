import { RenderControllerTarget } from "src/RenderController"
import { countingMessage } from "src/utils/debug"

import { getControllerTargetName } from "./general"

interface LoadCounts {
  [key: string]: number;
}

const loadCounts: LoadCounts = {}

export function resetLoadCount(targetName: string): number {
  countingMessage({
    text: `Resetting load count for target '${targetName}'`,
    level: 3,
  })
  loadCounts[targetName] = 0
  return getLoadCount(targetName)
}

export function getLoadCount(targetName: string): number {
  if (!(targetName in loadCounts)) {
    resetLoadCount(targetName)
  }
  const result = loadCounts[targetName]
  countingMessage({
    text: `Load count for target '${targetName}': ${result}`,
    level: 2,
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
  countingMessage({
    text: `Is first load for controller '${controllerName}' with ${targets.length} targets? ${result}`,
    level: 2,
  })
  return result
}

export function haveTargetsAttemptedLoading(
  controllerName: string,
  targets: RenderControllerTarget[]
): boolean {
  const total = totalTargetsAttemptedLoading(controllerName, targets)
  const result = total >= targets.length
  countingMessage({
    text: `Have all of ${controllerName}'s ${targets.length} targets attempted loading? ${result}`,
    level: 2,
  })
  return result
}

export function hasTargetAttemptedLoading(targetName: string): boolean {
  const result = getLoadCount(targetName) > 0
  countingMessage({
    text: `Has target '${targetName}' attempted loading? ${result}`,
    level: 2,
  })
  return result
}
