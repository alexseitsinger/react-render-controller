export const loadCounts = {}

export const getLoadCount = name => {
  return loadCounts[name] = loadCounts[name] || -1
}

export const resetLoadCount = name => {
  loadCounts[name] = -1
  return -1
}

export const updateLoadCount = name => {
  const lc = loadCounts[name] = loadCounts[name] || -1
  lc += 1
  return lc
}


