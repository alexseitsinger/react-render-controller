import { isMatchingPaths } from "./utils"
import { resetLoadCount } from "./counting"

const pathnames = {
  last: "",
  current: "",
}

const unloaders = {}

export const addUnloader = (last, current, skipped, unload, name) => {
  if (!(name in unloaders)) {
    const shouldUnload = (from, to) => {
      const isSkipped = skipped.map(skippedPathname => {
        const isFromMatching = isMatchingPaths(skippedPathname.from, from)
        const isToMatching = isMatchingPaths(skippedPathname.to, to)
        return ((isFromMatching === true) && (isToMatching === true))
      }).includes(true)
      return (isSkipped === false || last === current)
    }

    unloaders[name] = (from, to) => {
      if (shouldUnload(from, to) === true) {
        unload()
        resetLoadCount()
        delete unloaders[name]
      }
    }
  }
}

export const runUnloaders = (from, to) => {
  if (pathnames.current === to) {
    return
  }

  // Run unloaders
  Object.keys(unloaders).forEach(k => {
    unloaders[k](from, to)
  })

  // Save the pathanmes
  pathnames.last = from
  pathnames.current = to
}

