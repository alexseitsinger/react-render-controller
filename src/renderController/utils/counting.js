export const loadCounts = {}

export const getLoadCount = (currentPathname, name) => {
  if (!(currentPathname in loadCounts)) {
    loadCounts[currentPathname] = {}
  }
  var lc = loadCounts[currentPathname]
  if (!(name in lc)) {
    lc[name] = -1
  }
  return lc[name]
}

export const resetLoadCount = (currentPathname, name) => {
  if (!(currentPathname in loadCounts)) {
    loadCounts[currentPathname] = {}
  }
  var lc = loadCounts[currentPathname]
  lc[name] = -1
}

export const updateLoadCount = (currentPathname, name) => {
  if (!(currentPathname in loadCounts)) {
    loadCounts[currentPathname] = {}
  }
  var lc = loadCounts[currentPathname]
  if (!(name in lc)) {
    lc[name] = -1
  }
  lc[name] += 1
  return lc[name]
}


