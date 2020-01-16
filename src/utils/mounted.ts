import { debounce } from "underscore"

const mounted: string[] = []

export const addMounted = debounce((controllerName: string) => {
  const i = mounted.indexOf(controllerName)
  if (i === -1) {
    mounted.push(controllerName)
  }
}, 1000)

export const removeMounted = debounce((controllerName: string) => {
  const i = mounted.indexOf(controllerName)
  if (i > -1) {
    mounted.splice(i, 1)
  }
}, 1000)

export const hasBeenMounted = (controllerName: string): boolean => {
  const i = mounted.indexOf(controllerName)
  if (i > -1) {
    return true
  }
  return false
}
