import _ from "underscore"

export const isEmpty = data => {
  var result = false
  if (!data) {
    return true
  }
  if (_.isArray(data)) {
    // If its an empty array, set true
    if (_.isEmpty(data) === true) {
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
  else if (_.isObject(data)) {
    if (_.isEmpty(data) === true) {
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
    prepared.push(obj)
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



