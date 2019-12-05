const cachedData = {}

export const setCachedData = (fullName, data) => {
  console.log("caching...", fullName)
  cachedData[fullName] = {
    date: (new Date(Date.now()).toISOString()),
    data: data,
  }
}

export const getCachedData = fullName => {
  if (fullName in cachedData) {
    console.log("using cached", fullName)
    return cachedData[fullName].data
  }
}

export const unsetCachedData = fullName => {
  cachedData[fullName] = null
}

export const resetCachedData = () => {
  Object.keys(cachedData).forEach(key => {
    cachedData[key] = null
  })
}

export const shouldBeCached = (fullName, target) => {
  if (target.data) {
    if (target.cached && target.cached === true) {
      // check data expiration here.
      if (!(fullName in cachedData)) {
        consle.log("shouldBeCached: true", fullName)
        return true
      }
      // if expired -> true
    }
  }
  console.log("shouldBeCached: false", fullName)
  return false
}

