import { debugMessage } from "src/utils/debug"

let mounted: string[] = []

export function hasMounted(controllerName: string): boolean {
  const result = mounted.includes(controllerName)
  debugMessage(`Is controller '${controllerName}' mounted? ${result}`)
  return result
}

export function addMounted(controllerName: string): void {
  if (hasMounted(controllerName)) {
    return
  }
  debugMessage(`Setting controller '${controllerName}' as mounted`)
  mounted = [...mounted, controllerName]
}

export function removeMounted(controllerName: string): void {
  debugMessage(`Setting controller '${controllerName}' as unmounted`)
  mounted = mounted.filter(n => n !== controllerName)
}
