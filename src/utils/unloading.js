import {
  isFunction,
  isObject,
  isArray,
} from "underscore"

import {
  isMatchingPaths,
  prepareSkippedPathnames,
  getFullName,
} from "./general"
import {
  resetLoadCount,
} from "./counting"

const pathnames = {
  last: "/",
  current: "/",
}

const unloaders = {}

const shouldUnload = (from, to, lastPathname, currentPathname, skippedPathnames) => {
  // Prepare our pathnames inc ase reverse or toEither or fromEither is  used.
  const prepared = prepareSkippedPathnames(skippedPathnames)

  // Check if any of hte prepared pathnames are skipped.
  const isSkippedPathname = prepared.map(obj => {
    const isTo = isMatchingPaths(obj.to, to)
    const isFrom = isMatchingPaths(obj.from, from)
    return ((isFrom === true) && (isTo === true))
  }).includes(true)

  // If the pathname is labeled as skipped or its the same pathanme, then dont
  // unload.
  if (isSkippedPathname === true || currentPathname === lastPathname) {
    return false
  }

  // Otherwise, do unloading.
  return true
}

const addUnloader = ({
  lastPathname,
  currentPathname,
  skippedPathnames,
  handler,
  name,
}) => {
  if (name in unloaders) {
    return
  }

  unloaders[name] = (from, to) => {
    const should = shouldUnload(from, to, lastPathname, currentPathname, skippedPathnames)
    if (should) {
      handler()
      resetLoadCount()
      delete unloaders[name]
    }
  }
}

const runUnloaders = (from, to) => {
  // If we use multiple renderControllers on the same page, each one will invoke
  // the others unloaders unless we have this call to prevent unnecessary
  // repeated loading/unloading.
  if (pathnames.current === to) {
    return
  }

  const keys = Object.keys(unloaders)
  var k
  while (keys.length) {
    k = keys.shift()
    unloaders[k](from, to)
  }

  // Finally, update our saved pathnames for the next unloaders to use to
  // determine if they should run or not.
  pathnames.last = from
  pathnames.current = to
}

export const startUnloading = (
  controllerName,
  targets,
  lastPathname,
  currentPathname,
  skippedPathnames,
) => {
  runUnloaders(lastPathname, currentPathname)

  const prepareTarget = target => {
    const name = getFullName(controllerName, target.name)
    const handler = () => {
      if (isFunction(target.setter) && (isObject(target.empty) || isArray(target.empty))) {
        target.setter(target.empty)
      }
      resetLoadCount(name)
    }
    addUnloader({
      lastPathname,
      currentPathname,
      skippedPathnames,
      handler,
      name,
    })
  }

  targets.forEach(prepareTarget)
}


