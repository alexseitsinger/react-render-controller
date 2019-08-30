import _ from "underscore"

export const removeLeadingAndTrailingSlashes = url => {
  if (url.length === 1 && url === "/") {
    return url
  }
  url = url.replace(/^\//, "")
  url = url.replace(/\/$/, "")
  return url
}

export const isMatchingPaths = (skippedPathname, currentPathname) => {
  const skipped = removeLeadingAndTrailingSlashes(skippedPathname)
  const current = removeLeadingAndTrailingSlashes(currentPathname)
  if (skipped === current) {
    return true
  }
  const isTrue = result => (result === true)
  const currentBits = current.split("/")
  return skipped.split("/").map((skippedBit, i) => {
    const isWildcard = Boolean(
      skippedBit === "*"
      && currentBits.length
      && currentBits[i]
      && currentBits[i].length
    )
    const isMatching = Boolean(
      currentBits.length
      && currentBits[i]
      && currentBits[i] === skippedBit
    )
    return ((isMatching === true) || (isWildcard === true))
  }).every(isTrue)
}

export const createShouldSkipUnload = (currentPathname, skippedPathnames) => {
  return (from, to) => {
    return skippedPathnames.map(skippedPathname => {
      var isFromMatching
      var isToMatching
      if (_.isObject(skippedPathname)) {
        isFromMatching = isMatchingPaths(skippedPathname.from, from)
        isToMatching = isMatchingPaths(skippedPathname.to, to)
      }
      else {
        isFromMatching = isMatchingPaths(currentPathname, from)
        isToMatching = isMatchingPaths(skippedPathname, to)
      }
      return ((isFromMatching === true) && isToMatching === true)
    }).includes(true)
  }
}

const unloaders = []
export const runUnloaders = (from, to) => {
  unloaders.forEach((obj, i, arr) => {
    if (obj.shouldSkipUnload(from, to) === false) {
      obj.unload()
      arr.splice(i, 1)
    }
  })
}

export const addUnloader = (unload, shouldSkipUnload) => {
  if (unloaders.indexOf(unload) === -1) {
    unloaders.push({unload, shouldSkipUnload})
  }
}


const controllers = {}

export function getController(name) {
  if (!(name in controllers)) {
    controllers[name] = {
      count: 0,
      attempted: false,
    }
  }
  return controllers[name]
}

export function getAttempted(name) {
  const controller = getController(name)
  return Boolean(controller.attempted)
}

export function setAttempted(name, bool) {
  const controller = getController(name)
  controller.attempted = Boolean(bool)
  return controller.attempted
}

export function incrementCount(name) {
  const controller = getController(name)
  controller.count = ++controller.count
  return controller.count
}

export function decrementCount(name) {
  const controller = getController(name)
  controller.count = --controller.count
  controller.count = Math.max(0, controller.count)
  return controller.count
}

export function isEmpty(data) {
  var result
  if (!data) {
    return true
  }
  if (_.isArray(data)) {
    // If its an empty array, set true
    if (_.isEmpty(data)) {
      result = true
    }
    else {
      // If its an array of items, re-run this fn on each item.
      data.forEach(obj => {
        if (result) {
          return
        }
        result = isEmpty(obj)
      })
    }
  }
  else if (_.isObject(data)) {
    if (_.isEmpty(data)) {
      result = true
    }
  }
  return result
}
