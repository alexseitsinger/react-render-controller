import {
  isMatchingPaths,
  prepareSkippedPathnames,
} from "./general"
import { resetLoadCount } from "./counting"
import { resetLoadAttempted } from "./attempts"

export const pathnames = {
  last: "/",
  current: "/",
}

export const unloaders = {}

export const shouldUnload = (from, to, lastPathname, currentPathname, skippedPathnames) => {
  const prepared = prepareSkippedPathnames(skippedPathnames)

  const isSkipped = prepared.map(obj => {
    if (obj.to) {
      const isTo = isMatchingPaths(obj.to, to)
      if (obj.from) {
        const isFrom = isMatchingPaths(obj.from, from)
        return ((isFrom === true) && (isTo === true))
      }
      return (isTo === true)
    }
    return false
  }).includes(true)
  if (isSkipped === true || lastPathname === currentPathname) {
    return false
  }
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
    if (shouldUnload(from, to, lastPathname, currentPathname, skippedPathnames) === true) {
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

