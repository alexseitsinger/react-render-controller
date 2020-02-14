import { completingMessage } from "src/utils/debug"

let completed: string[] = []

export const hasCompleted = (controllerName: string): boolean => {
  const result = completed.includes(controllerName)
  completingMessage({
    text: `Has controller '${controllerName}' completed? ${result}`,
    level: 2,
  })
  return result
}

export const setUncompleted = (controllerName: string): void => {
  completingMessage({
    text: `Setting controller '${controllerName}' as uncompleted`,
    level: 2,
  })
  completed = completed.filter(n => n !== controllerName)
}

export const setCompleted = (controllerName: string): void => {
  if (hasCompleted(controllerName)) {
    return
  }
  completingMessage({
    text: `Setting controller '${controllerName}' as completed`,
    level: 2,
  })
  completed = [...completed, controllerName]
}
