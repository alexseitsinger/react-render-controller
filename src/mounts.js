const mounted = []

export const hasRecentlyMounted = name => {
  if (mounted.indexOf(name) === -1) {
    return false
  }
  return true
}

export const addRecentlyMounted = name => {
  if (mounted.indexOf(name) === -1) {
    mounted.push(name)
  }
}

export const removeRecentlyMounted = name => {
  if (mounted.indexOf(name) > -1) {
    mounted.splice(mounted.indexOf(name), 1)
  }
}
