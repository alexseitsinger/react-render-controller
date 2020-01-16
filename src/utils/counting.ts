import { LoadTarget } from "../.."

import { getFullName } from "./general"

export const loadCounts = {}

export const getLoadCount = (name: string): number => {
  if (!(name in loadCounts)) {
    loadCounts[name] = -1
  }
  return loadCounts[name]
}

export const resetLoadCount = (name: string): number => {
  loadCounts[name] = -1
  return -1
}

export const updateLoadCount = (name: string): number => {
  if (!(name in loadCounts)) {
    loadCounts[name] = -1
  }
  loadCounts[name] += 1
  return loadCounts[name]
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
