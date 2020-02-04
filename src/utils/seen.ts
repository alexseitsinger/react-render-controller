let seen: string[] = []

export const hasBeenSeen = (controllerName: string): boolean => {
  return seen.includes(controllerName)
}

export const removeControllerSeen = (controllerName: string): void => {
  seen = seen.filter(n => n !== controllerName)
}

export const addControllerSeen = (controllerName: string): void => {
  if (hasBeenSeen(controllerName)) {
    return
  }
  seen = [...seen, controllerName]
}
