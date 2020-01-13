export const controllersSeen: string[] = []

export const addControllerSeen = (name: string) => {
  const i = controllersSeen.indexOf(name)
  if (i === -1) {
    controllersSeen.push(name)
  }
}

export const removeControllerSeen = (name: string) => {
  const i = controllersSeen.indexOf(name)
  if (i > -1) {
    controllersSeen.splice(i, 1)
  }
}

export const hasControllerBeenSeen = (name: string): boolean => {
  const i = controllersSeen.indexOf(name)
  if (i > -1) {
    return true
  }
  return false
}

