import { isMatchingPaths } from "./utils"
import { resetLoadCount } from "./counting"

const pathnames = {
  last: "",
  current: "",
}

const unloaders = {}

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

  skippedPathnames.forEach((obj, i, arr) => {
    if (obj.reverse && obj.reverse === true) {
      arr.push({
        from: obj.to,
        to: obj.from,
      })
    }
  })

  const shouldUnload = (from, to) => {
    const isSkipped = skippedPathnames.map(skippedPathname => {
      const isFromMatching = isMatchingPaths(skippedPathname.from, from)
      const isToMatching = isMatchingPaths(skippedPathname.to, to)
      return ((isFromMatching === true) && (isToMatching === true))
    }).includes(true)
    return ((isSkipped === false) || (lastPathname === currentPathname))
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

