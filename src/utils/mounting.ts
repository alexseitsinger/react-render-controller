import { debugMessage } from "src/utils/debug"

const sectionName = "mounting"

let mounted: string[] = []

export function hasMounted(controllerName: string): boolean {
  const result = mounted.includes(controllerName)
  debugMessage({
    message: `Is controller '${controllerName}' mounted? ${result}`,
    sectionName,
  })
  return result
}

export function setMounted(controllerName: string): void {
  if (hasMounted(controllerName)) {
    return
  }
  debugMessage({
    message: `Setting controller '${controllerName}' as mounted`,
    sectionName,
  })
  mounted = [...mounted, controllerName]
}

export function setUnmounted(controllerName: string): void {
  debugMessage({
    message: `Setting controller '${controllerName}' as unmounted`,
    sectionName,
  })
  mounted = mounted.filter(n => n !== controllerName)
}
