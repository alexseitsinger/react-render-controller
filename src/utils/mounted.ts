import { debounce } from "underscore"

const mounted: string[] = []

export const addMounted = debounce((name: string) => {
  const i = mounted.indexOf(name)
  if (i === -1) {
    mounted.push(name)
  }
}, 1000)

export const removeMounted = debounce((name: string) => {
  const i = mounted.indexOf(name)
  if (i > -1) {
    mounted.splice(i, 1)
  }
}, 1000)

export const hasBeenMounted = (name: string): boolean => {
  const i = mounted.indexOf(name)
  if (i > -1) {
    return true
  }
  return false
}
