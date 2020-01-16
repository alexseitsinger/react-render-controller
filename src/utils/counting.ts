import { getFullName } from "./general"

import { LoadTarget } from "../.."

interface LoadCounts {
  [key: string]: number;
}

export const loadCounts: LoadCounts = {}

export const getLoadCount = (controllerName: string): number => {
  if (!(controllerName in loadCounts)) {
    loadCounts[controllerName] = -1
  }
  return loadCounts[controllerName]
}

export const resetLoadCount = (controllerName: string): number => {
  loadCounts[controllerName] = -1
  return -1
}

export const updateLoadCount = (controllerName: string): number => {
  if (!(controllerName in loadCounts)) {
    loadCounts[controllerName] = -1
  }
  loadCounts[controllerName] += 1
  return loadCounts[controllerName]
}

export const checkForFirstLoad = (
  controllerName: string,
  targets: LoadTarget[]
): boolean => {
  var total = 0

  targets.forEach((target: LoadTarget) => {
    const fullName = getFullName(controllerName, target.name)
    total += getLoadCount(fullName)
  })

  if (total <= 0) {
    return true
  }
  return false
}

export const hasTargetAttemptedLoad = (fullName: string): boolean => {
  if (getLoadCount(fullName) < 0) {
    return false
  }
  return true
}
