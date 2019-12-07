import { debounce } from "underscore"

const mounted = []

export const addMounted = debounce(name => {
  const i = mounted.indexOf(name)
  if (i === -1) {
    mounted.push(name)
  }
}, 1000)

export const removeMounted = debounce(name => {
  const i = mounted.indexOf(name)
  if (i > -1) {
    mounted.splice(i, 1)
  }
}, 1000)

export const hasBeenMounted = name => {
  const i = mounted.indexOf(name)
  if (i > -1) {
    return true
  }
  return false
}
