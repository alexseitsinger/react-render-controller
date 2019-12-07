import { getFullName } from "./general"

export const loadCounts = {}

export const getLoadCount = name => {
  if (!(name in loadCounts)) {
    loadCounts[name] = -1
  }
  return loadCounts[name]
}

export const resetLoadCount = name => {
  loadCounts[name] = -1
  return -1
}

export const updateLoadCount = name => {
  if (!(name in loadCounts)) {
    loadCounts[name] = -1
  }
  loadCounts[name] += 1
  return loadCounts[name]
}

export const checkForFirstLoad = (controllerName, targets) => {
  var total = 0

  targets.forEach(target => {
    const fullName = getFullName(controllerName, target.name)
    total += getLoadCount(fullName)
  })

  if (total <= 0) {
    return true
  }
  return false
}

export const hasTargetAttemptedLoad = fullName => {
  if (getLoadCount(fullName) < 0) {
    return false
  }
  return true
}

