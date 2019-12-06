const cachedData = {}

export const setCachedData = (fullName, data) => {
  cachedData[fullName] = {
    name: fullName,
    date: (new Date(Date.now()).toISOString()),
    data: data,
  }
}

export const getCachedData = fullName => {
  if (fullName in cachedData) {
    return cachedData[fullName].data
  }
}

export const unsetCachedData = fullName => {
  cachedData[fullName] = null
}

export const clearCachedData = () => {
  Object.keys(cachedData).forEach(key => {
    cachedData[key] = null
  })
}

export const shouldBeCached = (fullName, target) => {
  if (target.data) {
    if (target.cached && target.cached === true) {
      // check data expiration here.
      if (!(fullName in cachedData)) {
        return true
      }
      // if expired -> true
    }
  }
  return false
}

