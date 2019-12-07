import { debounce } from "underscore"

export const resetDelay = 12000
export const attempted = {}

export const hasLoadAttempted = (currentPathname, name) => {
  if (!(currentPathname in attempted)) {
    attempted[currentPathname] = []
  }
  const names = attempted[currentPathname]
  const i = names.indexOf(name)
  if (i > -1) {
    return true
  }
  return false
}

export const addLoadAttempted = (currentPathname, name) => {
  if (!(currentPathname in attempted)) {
    attempted[currentPathname] = []
  }
  const names = attempted[currentPathname]
  if (hasLoadAttempted(currentPathname, name) === false) {
    names.push(name)
  }
}

export const removeLoadAttempted = (currentPathname, name) => {
  if (!(currentPathname in attempted)) {
    attempted[currentPathname] = []
  }
  const names = attempted[currentPathname]
  const i = names.indexOf(name)
  if (i > -1) {
    names.splice(i, 1)
  }
}

export const resetLoadAttempted = debounce(currentPathname => {
  if (!(currentPathname in attempted)) {
    attempted[currentPathname] = []
  }
  const names = attempted[currentPathname]
  while (names.length) {
    names.shift()
  }
}, resetDelay)
