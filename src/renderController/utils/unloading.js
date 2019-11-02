import {
  isMatchingPaths,
  prepareSkippedPathnames,
} from "./general"
import { resetLoadCount } from "./counting"

export const pathnames = {
  last: "",
  current: "",
}

export const unloaders = {}

export const addUnloader = ({
  lastPathname,
  currentPathname,
  skippedPathnames,
  handler,
  name,
}) => {
  if (name in unloaders) {
    return
  }

  const prepared = prepareSkippedPathnames(skippedPathnames)

  const shouldUnload = (from, to) => {
    const isSkipped = prepared.map(obj => {
      const isFrom = isMatchingPaths(obj.from, from)
      const isTo = isMatchingPaths(obj.to, to)
      return ((isFrom === true) && (isTo === true))
    }).includes(true)

    if (isSkipped === true) {
      return false
    }

    if (lastPathname === currentPathname) {
      return false
    }

    return true
  }

  unloaders[name] = (from, to) => {
    if (shouldUnload(from, to) === true) {
      handler()
      resetLoadCount()
      delete unloaders[name]
    }
  }
}

export const runUnloaders = (from, to) => {
  if (pathnames.current === to) {
    return
  }

  // Save the pathanmes
  pathnames.last = from
  pathnames.current = to

  // Run unloaders
  Object.keys(unloaders).forEach(k => {
    unloaders[k](from, to)
  })
}

