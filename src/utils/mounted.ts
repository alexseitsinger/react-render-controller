//import { debounce } from "underscore"

let mounted: string[] = []

export const hasBeenMounted = (controllerName: string): boolean => {
  return mounted.includes(controllerName)
}

export const addMounted = (controllerName: string): void => {
  if (hasBeenMounted(controllerName)) {
    return
  }
  mounted = [...mounted, controllerName]
}

export const removeMounted = (controllerName: string): void => {
  mounted = mounted.filter(n => n !== controllerName)
}
