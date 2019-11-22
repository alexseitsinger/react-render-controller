import _ from "underscore"

import {
  isMatchingPaths,
  prepareSkippedPathnames,
  getFullName,
} from "./general"
import { resetLoadCount } from "./counting"
import { resetLoadAttempted } from "./attempts"

export const pathnames = {
  last: "/",
  current: "/",
}

export const unloaders = {}

export const shouldUnload = (from, to, lastPathname, currentPathname, skippedPathnames) => {
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
  if (isSkippedPathname === true || lastPathname === currentPathname) {
    return false
  }

  // Otherwise, do unloading.
  return true
}

export const addUnloader = ({
  lastPathname,
  currentPathname,
  skippedPathnames,
  handler,
  name,
}) => {

  if (!(currentPathname in unloaders)) {
    unloaders[currentPathname] = {}
  }

  const unloadersForPage = unloaders[currentPathname]
  if (name in unloadersForPage) {
    return
  }

  function targetUnloader(from, to) {
    const should = shouldUnload(from, to, lastPathname, currentPathname, skippedPathnames)
    if (should === true) {
      handler()
      resetLoadCount()
      delete unloadersForPage[name]
    }
  }

  unloadersForPage[name] = targetUnloader
}

export const runUnloaders = (from, to) => {
  // If we use multiple renderControllers on the same page, each one will invoke
  // the others unloaders unless we have this call to prevent unnecessary
  // repeated loading/unloading.
  if (pathnames.current === to) {
    return
  }

  // Ensure our unloaders are already there.
  if (!(from in unloaders)) {
    unloaders[from] = {}
  }
  const unloadersForPage = unloaders[from]

  // To ensure that our unloaders run before we add any others, make it a
  // synchronous action by using a while loop. These are also more efficient.
  var keys = Object.keys(unloadersForPage)
  var key
  while (keys.length) {
    key = keys.shift()
    unloadersForPage[key](from, to)
  }

  // Finally, update our saved pathnames for the next unloaders to use to
  // determine if they should run or not.
  pathnames.last = from
  pathnames.current = to
}

export const handleUnload = _.debounce((controllerName, targets, currentPathname) => {
  targets.forEach(obj => {
    if (_.isFunction(obj.unload)) {
      obj.unload()
    }

    const fullTargetName = getFullName(controllerName, obj.name)
    resetLoadCount(fullTargetName)
  })
}, 1000)

export const processUnloaders = (
  controllerName,
  targets,
  lastPathname,
  currentPathname,
  skippedPathnames,
) => {
  runUnloaders(lastPathname, currentPathname)

  targets.forEach(obj => {
    const fullTargetName = getFullName(controllerName, obj.name)

    addUnloader({
      lastPathname,
      currentPathname,
      skippedPathnames,
      handler: () => handleUnload(controllerName, targets, currentPathname),
      name: fullTargetName,
    })
  })
}


