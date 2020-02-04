import { RenderControllerTarget } from "src/RenderController"

import { getControllerTargetName } from "./general"

interface LoadCounts {
  [key: string]: number;
}

const loadCounts: LoadCounts = {}

export const getLoadCount = (targetName: string): number => {
  if (!(targetName in loadCounts)) {
    loadCounts[targetName] = -1
  }
  return loadCounts[targetName]
}

export const resetLoadCount = (targetName: string): number => {
  loadCounts[targetName] = -1
  return -1
}

export const updateLoadCount = (targetName: string): number => {
  if (!(targetName in loadCounts)) {
    loadCounts[targetName] = -1
  }
  loadCounts[targetName] += 1
  return loadCounts[targetName]
}

interface CheckForFirstLoadArgs {
  lastPathname: string;
  currentPathname: string;
  targets: RenderControllerTarget[];
}

export const checkForFirstLoad = ({
  lastPathname,
  currentPathname,
  targets,
}: CheckForFirstLoadArgs): boolean => {
  let total = 0

  targets.forEach((target: RenderControllerTarget): void => {
    const targetName = getControllerTargetName({
      lastPathname,
      currentPathname,
      target,
    })

    total += getLoadCount(targetName)
  })

  if (total <= 0) {
    return true
  }
  return false
}

export const hasTargetAttemptedLoad = (targetName: string): boolean => {
  if (getLoadCount(targetName) < 0) {
    return false
  }
  return true
}
