import { RenderControllerTarget } from "src/RenderController"

interface Attempted {
  [key: string]: string[];
}

const attempted: Attempted = {}

export const setAttempted = (
  controllerName: string,
  targetName: string
): void => {
  if (!(controllerName in attempted)) {
    attempted[controllerName] = []
  }
  attempted[controllerName] = [...attempted[controllerName], targetName]
}

export const areAttempted = (
  controllerName: string,
  targets: RenderControllerTarget[]
): boolean => {
  if (!(controllerName in attempted)) {
    attempted[controllerName] = []
  }
  const names = attempted[controllerName]
  return names.length === targets.length
}

export const resetAttempted = (controllerName: string): void => {
  attempted[controllerName] = []
}
