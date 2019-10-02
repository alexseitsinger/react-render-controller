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

  var currentBits
  if (current === "/") {
    currentBits = ["/"]
  }
  else {
    currentBits = current.split("/")
  }
  currentBits = currentBits.filter(bit => bit.length > 0)

  const isTrue = result => (result === true)

  return skipped.split("/").map((skippedBit, i) => {
    if (skippedBit === "*") {
      return true
    }
    const isMatching = (
      currentBits.length
      && currentBits[i]
      && currentBits[i] === skippedBit
    )
    return (isMatching === true)
  }).every(isTrue)
}

export const createShouldUnload = (last, current, skipped) => (from, to) => {
  const isSkipped = skipped.map(skippedPathname => {
    const isFromMatching = isMatchingPaths(skippedPathname.from, from)
    const isToMatching = isMatchingPaths(skippedPathname.to, to)
    return ((isFromMatching === true) && (isToMatching === true))
  }).includes(true)

  return (isSkipped === false || last === current)
}

const pathnames = {
  last: "",
  current: "",
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
    const shouldUnload = createShouldUnload(last, current, skipped)

    unloaders[dataName] = (from, to, callback) => {
      if (shouldUnload(from, to) === true) {
        unload()
        callback()
      }
    }
  }
}

export const runUnloaders = (from, to) => {
  const { current } = pathnames
  if (current === to) {
    return
  }

  // Run unloaders
  Object.keys(unloaders).forEach((k, i, a) => {
    unloaders[k](from, to, () => {
      delete unloaders[k]
    })
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
