export const controllersSeen: string[] = []

export const addControllerSeen = (controllerName: string): void => {
  const i = controllersSeen.indexOf(controllerName)
  if (i === -1) {
    controllersSeen.push(controllerName)
  }
}

export const removeControllerSeen = (controllerName: string): void => {
  const i = controllersSeen.indexOf(controllerName)
  if (i > -1) {
    controllersSeen.splice(i, 1)
  }
}

export const hasControllerBeenSeen = (controllerName: string): boolean => {
  const i = controllersSeen.indexOf(controllerName)
  if (i > -1) {
    return true
  }
  return false
}
