import { debugMessage } from "src/utils/debug"

const sectionName = "completing"

let completed: string[] = []

export const hasCompleted = (controllerName: string): boolean => {
  const result = completed.includes(controllerName)
  debugMessage({
    message: `Has controller '${controllerName}' completed? ${result}`,
    sectionName,
  })
  return result
}

export const setUncompleted = (controllerName: string): void => {
  debugMessage({
    message: `Setting controller '${controllerName}' as uncompleted`,
    sectionName,
  })
  completed = completed.filter(n => n !== controllerName)
}

export const setCompleted = (controllerName: string): void => {
  if (hasCompleted(controllerName)) {
    return
  }
  debugMessage({
    message: `Setting controller '${controllerName}' as completed`,
    sectionName,
  })
  completed = [...completed, controllerName]
}
