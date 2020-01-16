import { debounce } from "underscore"

import { LoadTarget, SkippedPathname } from "../.."

export const getFullName = (
  controllerName: string,
  targetName: string
): string => `${controllerName}__${targetName}`

export const removeLeadingAndTrailingSlashes = (url: string): string => {
  var updated = url
  if (updated.length === 1 && updated === "/") {
    return updated
  }
  updated = updated.replace(/^\//, "")
  updated = updated.replace(/\/$/, "")
  return updated
}

export const prepareSkippedPathnames = (
  skippedPathnames: SkippedPathname[]
) => {
  const prepared: SkippedPathname[] = []

  skippedPathnames.forEach(obj => {
    prepared.push({
      from: obj.from,
      to: obj.to,
    })

    if (obj.reverse && obj.reverse === true) {
      prepared.push({
        from: obj.to,
        to: obj.from,
      })
    }
  })

  return prepared
}

export const isMatchingPaths = (
  skippedPathname: string,
  currentPathname: string
): boolean => {
  const skipped = removeLeadingAndTrailingSlashes(skippedPathname)
  const current = removeLeadingAndTrailingSlashes(currentPathname)

  if (skipped === current) {
    return true
  }

  let currentBits: string[]
  if (current === "/") {
    currentBits = ["/"]
  }
  else {
    currentBits = current.split("/")
  }
  currentBits = currentBits.filter(bit => bit.length > 0)

  const isTrue = (result: boolean) => result === true

  return skipped
    .split("/")
    .map((skippedBit, i) => {
      if (skippedBit === "*") {
        return true
      }
      const isMatching
        = currentBits.length && currentBits[i] && currentBits[i] === skippedBit
      return isMatching === true
    })
    .every(isTrue)
}

export const getMasterName = (
  currentPathname: string,
  targets: LoadTarget[]
) => {
  var masterName = removeLeadingAndTrailingSlashes(currentPathname)
  masterName = masterName.replace("/", "_")

  targets.forEach(obj => {
    masterName = `${masterName}__${obj.name}`
  })

  return masterName
}

export const createCancellableMethod = (
  delay: number,
  callback: () => void
) => {
  var isCancelled = false

  const method = debounce(() => {
    if (isCancelled === true) {
      return
    }

    callback()
  }, delay)

  const canceller = () => {
    isCancelled = true
  }

  return {
    method,
    canceller,
  }
}
