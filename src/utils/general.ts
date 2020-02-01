import { debounce } from "underscore"

import { LoadTarget, SkippedPathname } from "../types"

export const isNullish = (o?: any): boolean => {
  if (o === undefined || o === null) {
    return true
  }
  return false
}

export const isDefined = (o?: any): boolean => {
  if (isNullish(o)) {
    return false
  }
  return true
}

const normalizePathname = (pn: string): string => {
  return pn.replace(/\/\/+/, "/")
}

const convertPathname = (pathname: string): string => {
  const normalized = normalizePathname(pathname)
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

export interface GetControllerNamePrefixArgs {
  lastPathname: string;
  currentPathname: string;
}

const getControllerNamePrefix = ({
  lastPathname,
  currentPathname,
}: GetControllerNamePrefixArgs): string => {
  const convertedLast = convertPathname(lastPathname)
  const convertedCurrent = convertPathname(currentPathname)
  return `[${convertedLast}]___[${convertedCurrent}]`
}

export interface GetControllerNameSuffixArgs {
  targets: LoadTarget[];
}

const getControllerNameSuffix = ({
  targets,
}: GetControllerNameSuffixArgs): string => {
  return `[${targets
    .map((target: LoadTarget): string => target.name)
    .join(",")}]`
}

export interface GetControllerNameArgs {
  lastPathname: string;
  currentPathname: string;
  targets: LoadTarget[];
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
  const suffix = getControllerNameSuffix({
    targets,
  })
  return `${prefix}___${suffix}`
}

export interface GetTargetNameArgs {
  lastPathname: string;
  currentPathname: string;
  target: LoadTarget;
}

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
): SkippedPathname[] => {
  const prepared: SkippedPathname[] = []

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

export const getMasterName = (
  currentPathname: string,
  targets: LoadTarget[]
): string => {
  var masterName = removeLeadingAndTrailingSlashes(currentPathname)
  masterName = masterName.replace("/", "_")

  targets.forEach(obj => {
    masterName = `${masterName}__${obj.name}`
  })

  return masterName
}

export type CreateCancellableMethodReturnType = (() => void)[]

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
