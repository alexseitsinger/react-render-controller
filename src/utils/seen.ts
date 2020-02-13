import { debugMessage } from "src/utils/debug"

let seen: string[] = []

export const hasSeen = (controllerName: string): boolean => {
  const result = seen.includes(controllerName)
  debugMessage(`Has controller '${controllerName}' been seen? ${result}`)
  return result
}

export const removeControllerSeen = (controllerName: string): void => {
  debugMessage(`Setting controller '${controllerName}' as unseen`)
  seen = seen.filter(n => n !== controllerName)
}

export const addControllerSeen = (controllerName: string): void => {
  if (hasSeen(controllerName)) {
    return
  }
  debugMessage(`Setting controller '${controllerName}' as seen`)
  seen = [...seen, controllerName]
}
