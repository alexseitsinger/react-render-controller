export const controllersSeen = []

export const addControllerSeen = name => {
  const i = controllersSeen.indexOf(name)
  if (i === -1) {
    controllersSeen.push(name)
  }
}

export const removeControllerSeen = name => {
  const i = controllersSeen.indexOf(name)
  if (i > -1) {
    controllersSeen.splice(i, 1)
  }
}

export const hasControllerBeenSeen = name => {
  const i = controllersSeen.indexOf(name)
  if (i > -1) {
    return true
  }
  return false
}


