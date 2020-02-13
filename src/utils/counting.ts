import { RenderControllerTarget } from "src/RenderController"
import { debugMessage } from "src/utils/debug"

import { getControllerTargetName } from "./general"

interface LoadCounts {
  [key: string]: number;
}

const loadCounts: LoadCounts = {}
export function resetLoadCount(targetName: string): number {
  debugMessage(`Resetting load count for target '${targetName}'`)
  loadCounts[targetName] = 0
  return getLoadCount(targetName)
}

export function getLoadCount(targetName: string): number {
  if (!(targetName in loadCounts)) {
    resetLoadCount(targetName)
  }
  const result = loadCounts[targetName]
  debugMessage(`Load count for target '${targetName}': ${result}`)
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
  debugMessage(
    `Is first load for controller '${controllerName}' with ${targets.length} targets? ${result}`
  )
  return result
}

export function haveTargetsAttemptedLoading(
  controllerName: string,
  targets: RenderControllerTarget[]
): boolean {
  const total = totalTargetsAttemptedLoading(controllerName, targets)
  const result = total === targets.length
  debugMessage(
    `Have all ${targets.length} targets attempted loading? ${result}`
  )
  return result
}

export function hasTargetAttemptedLoading(targetName: string): boolean {
  const result = getLoadCount(targetName) > 0
  debugMessage(`Has target '${targetName}' attempted loading? ${result}`)
  return result
}
