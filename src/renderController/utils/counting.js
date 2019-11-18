export const loadCounts = {}

export const getLoadCount = name => {
  if (!(name in loadCounts)) {
    loadCounts[name] = -1
  }
  return loadCounts[name]
}

export const resetLoadCount = name => {
  loadCounts[name] = -1
  return -1
}

export const updateLoadCount = name => {
  if (!(name in loadCounts)) {
    loadCounts[name] = -1
  }
  loadCounts[name] += 1
  return loadCounts[name]
}


