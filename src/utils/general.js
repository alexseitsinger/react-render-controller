import {
  isArray,
  isEmpty,
  isObject,
  debounce,
} from "underscore"

export const getFullName = (controllerName, targetName) => {
  return `${controllerName}__${targetName}`
}

export const isDataEmpty = data => {
  var result = false
  if (!data) {
    return true
  }
  if (isArray(data)) {
    // If its an empty array, set true
    if (isEmpty(data) === true) {
      result = true
    }
    else {
      // If its an array of items, re-run this fn on each item.
      data.forEach(obj => {
        if (result === true) {
          return
        }
        result = isEmpty(obj)
      })
    }
  }
  else if (isObject(data)) {
    if (isEmpty(data) === true) {
      result = true
    }
  }
  return result
}

export const removeLeadingAndTrailingSlashes = url => {
  var updated = url
  if (updated.length === 1 && updated === "/") {
    return updated
  }
  updated = updated.replace(/^\//, "")
  updated = updated.replace(/\/$/, "")
  return updated
}

export const prepareSkippedPathnames = skippedPathnames => {
  const prepared = []

  skippedPathnames.forEach(obj => {
    prepared.push({
      from: obj.from,
      to: obj.to,
    })

    if (obj.reverse && obj.reverse === true) {
      prepared.push({
        from: obj.to,
        to: obj.from,
      })
    }
  })

  return prepared
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


export const getMasterName = (currentPathname, targets) => {
  var masterName = removeLeadingAndTrailingSlashes(currentPathname)
  masterName = masterName.replace("/", "_")

  targets.forEach(obj => {
    masterName = `${masterName}__${obj.name}`
  })

  return masterName
}

export const createCancellableMethod = (delay, callback)  => {
  var isCancelled = false

  const method = debounce(() => {
    if (isCancelled === true) {
      return
    }

    callback()
  }, delay)

  const canceller = () => {
    isCancelled = true
  }

  return {
    method,
    canceller,
  }
}

