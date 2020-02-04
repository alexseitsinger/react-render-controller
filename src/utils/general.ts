import { debounce } from "underscore"

import {
  RenderControllerPathnames,
  RenderControllerSkippedPathname,
  RenderControllerTarget,
} from "src/RenderController"

const convertPathname = (pn: string): string => {
  const normalized = pn.replace(/\/\/+/, "/")
  if (normalized === "/") {
    return "root"
  }
  const bits = normalized.split("/")
  const joined = bits.join(":")
  if (joined.startsWith(":")) {
    return joined.slice(1)
  }
  return joined
}

export const getControllerNamePrefix = ({
  lastPathname,
  currentPathname,
}: RenderControllerPathnames): string => {
  const convertedLast = convertPathname(lastPathname)
  const convertedCurrent = convertPathname(currentPathname)
  return `[${convertedLast}]___[${convertedCurrent}]`
}

type GetControllerNameArgs = RenderControllerPathnames & {
  targets: RenderControllerTarget[],
}

export const getControllerName = ({
  lastPathname,
  currentPathname,
  targets,
}: GetControllerNameArgs): string => {
  const prefix = getControllerNamePrefix({
    lastPathname,
    currentPathname,
  })
  const suffix = `[${targets
    .map((target: RenderControllerTarget): string => target.name)
    .join(",")}]`
  return `${prefix}___${suffix}`
}

type GetControllerTargetNameArgs = RenderControllerPathnames & {
  target: RenderControllerTarget,
}

export const getControllerTargetName = ({
  lastPathname,
  currentPathname,
  target,
}: GetControllerTargetNameArgs): string => {
  return getControllerName({
    lastPathname,
    currentPathname,
    targets: [target],
  })
}

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
  skippedPathnames: RenderControllerSkippedPathname[]
): RenderControllerSkippedPathname[] => {
  const prepared: RenderControllerSkippedPathname[] = []

  skippedPathnames.forEach(obj => {
    prepared.push({
      from: obj.from,
      to: obj.to,
    })

    if (obj.reverse !== undefined && obj.reverse === true) {
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
  } else {
    currentBits = current.split("/")
  }
  currentBits = currentBits.filter(bit => bit.length > 0)

  const isTrue = (result: boolean): boolean => result === true

  return skipped
    .split("/")
    .map((skippedBit, i) => {
      if (skippedBit === "*") {
        return true
      }
      const isMatching =
        currentBits.length > 0 &&
        currentBits[i] !== undefined &&
        currentBits[i] === skippedBit
      return isMatching === true
    })
    .every(isTrue)
}

type CreateCancellableMethodReturnType = (() => void)[]

export const createCancellableMethod = (
  delay: number,
  callback: () => void
): CreateCancellableMethodReturnType => {
  var isCancelled = false

  const method = debounce(() => {
    if (isCancelled === true) {
      return
    }

    callback()
  }, delay)

  const canceller = (): void => {
    isCancelled = true
  }

  return [method, canceller]
}
