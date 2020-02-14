import { mountingMessage } from "src/utils/debug"

let mounted: string[] = []

export function hasMounted(controllerName: string): boolean {
  const result = mounted.includes(controllerName)
  mountingMessage({
    text: `Is controller '${controllerName}' mounted? ${result}`,
    level: 2,
  })
  return result
}

export function setMounted(controllerName: string): void {
  if (hasMounted(controllerName)) {
    return
  }
  mountingMessage({
    text: `Setting controller '${controllerName}' as mounted`,
    level: 2,
  })
  mounted = [...mounted, controllerName]
}

export function setUnmounted(controllerName: string): void {
  mountingMessage({
    text: `Setting controller '${controllerName}' as unmounted`,
    level: 3,
  })
  mounted = mounted.filter(n => n !== controllerName)
}
