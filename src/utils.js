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

const pathnames = {
  last: "",
  current: "",
}

const isSameNavigation = (from, to) => {
  const isLastSame = (pathnames.last === from)
  const isCurrentSame = (pathnames.current === to)
  return (isLastSame && isCurrentSame)
}

const loaders = {}
export const addLoader = (dataName, method) => {
  if (!( dataName in loaders )) {
    loaders[dataName] = method
  }
}

export const runLoaders = _.debounce((from, to) => {
  Object.keys(loaders).forEach((k, i, a) => {
    loaders[k]()
    delete loaders[k]
  })
}, 2500)

export const createShouldUpdate = () => {
  var ct = 0

  return () => {
    ct += 1

    const methods = Object.keys(loaders)
    const total = methods.length
    if (ct > total) {
      return true
    }

    return false
  }
}


const unloaders = {}
export const addUnloader = (last, current, skipped, unload, dataName) => {
  if (!( dataName in unloaders )) {
    const shouldSkipUnload = createShouldSkipUnload(last, current, skipped)
    const handler = (from, to) => {
      if (shouldSkipUnload(from, to) === false) {
        unload()
      }
    }
    unloaders[dataName] = handler
  }
}

export const runUnloaders = (from, to) => {
  // If its the same pathname, don't unload.
  if (isSameNavigation(from, to) === true) {
    return
  }

  Object.keys(unloaders).forEach((k, i, a) => {
    unloaders[k](from, to)
    delete unloaders[k]
  })

  // Save the pathanmes
  pathnames.last = from
  pathnames.current = to
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
