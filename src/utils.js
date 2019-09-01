import _ from "underscore"

export const removeLeadingAndTrailingSlashes = url => {
  var updated = url
  if (updated.length === 1 && updated === "/") {
    return updated
  }
  updated = updated.replace(/^\//, "")
  updated = updated.replace(/\/$/, "")
  return updated
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
      skippedBit === "*" && currentBits.length && currentBits[i] && currentBits[i].length
    )
    const isMatching = Boolean(
      currentBits.length && currentBits[i] && currentBits[i] === skippedBit
    )
    return ((isMatching === true) || (isWildcard === true))
  })
    .every(isTrue)
}

export const createShouldSkipUnload = (
  lastPathname, currentPathname, skippedPathnames
) => (from, to) => {
  if (lastPathname === currentPathname) {
    return true
  }
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

const loaders = {}
export const addLoader = (name, fn) => {
  if (!( name )) {
    throw "There is not name for data."
  }
  if (!( name in loaders )) {
    loaders[name] = fn
  }
}
export const runLoaders = _.debounce(() => {
  Object.keys(loaders).forEach(key => {
    loaders[key]()
    delete loaders[key]
  })
}, 3000)


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
    unloaders.push({ unload, shouldSkipUnload })
  }
}

export const isEmpty = data => {
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
