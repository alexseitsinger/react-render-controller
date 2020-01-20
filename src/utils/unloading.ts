import { isArray, isFunction, isObject } from "underscore"

import { resetLoadCount } from "./counting"
import {
  getFullName,
  isMatchingPaths,
  prepareSkippedPathnames,
} from "./general"

import { LoadTarget, SkippedPathname } from "../.."

const pathnames = {
  last: "/",
  current: "/",
}

interface Unloaders {
  [name: string]: (from: string, to: string) => void;
}

const unloaders: Unloaders = {}

const shouldUnload = (
  from: string,
  to: string,
  skippedPathnames: SkippedPathname[]
): boolean => {
  // Prepare our pathnames inc ase reverse or toEither or fromEither is  used.
  const prepared = prepareSkippedPathnames(skippedPathnames)

  // Check if any of hte prepared pathnames are skipped.
  const isSkippedPathname = prepared
    .map((obj: SkippedPathname) => {
      const isTo = isMatchingPaths(obj.to, to)
      const isFrom = isMatchingPaths(obj.from, from)
      return isFrom === true && isTo === true
    })
    .includes(true)

  // If the pathname is labeled as skipped or its the same pathanme, then dont
  // unload.
  if (isSkippedPathname === true) {
    return false
  }

  // Otherwise, do unloading.
  return true
}

const addUnloader = (
  skippedPathnames: SkippedPathname[],
  handler: () => void,
  targetName: string
) => {
  if (targetName in unloaders) {
    return
  }

  unloaders[targetName] = (from: string, to: string) => {
    const should = shouldUnload(from, to, skippedPathnames)
    if (should) {
      handler()
      resetLoadCount(targetName)
      delete unloaders[targetName]
    }
  }
}

const runUnloaders = (from: string, to: string) => {
  // If we use multiple renderControllers on the same page, each one will invoke
  // the others unloaders unless we have this call to prevent unnecessary
  // repeated loading/unloading.
  if (pathnames.current === to) {
    return
  }

  const keys = Object.keys(unloaders)
  while (keys.length) {
    const k = keys.shift()
    if (k) {
      unloaders[k](from, to)
    }
  }

  // Finally, update our saved pathnames for the next unloaders to use to
  // determine if they should run or not.
  pathnames.last = from
  pathnames.current = to
}

export const startUnloading = (
  controllerName: string,
  targets: LoadTarget[],
  lastPathname: string,
  currentPathname: string,
  skippedPathnames: SkippedPathname[]
) => {
  runUnloaders(lastPathname, currentPathname)

  const prepareTarget = (target: LoadTarget) => {
    const fullControllerName = getFullName(controllerName, target.targetName)
    const handler = () => {
      if (
        isFunction(target.setter) &&
        (isObject(target.empty) || isArray(target.empty))
      ) {
        target.setter(target.empty)
        resetLoadCount(fullControllerName)
      }
    }

    addUnloader(skippedPathnames, handler, fullControllerName)
  }

  targets.forEach(prepareTarget)
}
