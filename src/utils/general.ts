import { debounce } from "underscore"

import {
  RenderControllerSkippedPathname,
  RenderControllerTarget,
} from "src/RenderController"

interface GetControllerTargetNameArgs {
  target: RenderControllerTarget;
  controllerName: string;
}

export const getControllerTargetName = ({
  controllerName,
  target,
}: GetControllerTargetNameArgs): string => {
  return `[${controllerName}]__[${target.name}]`
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

type Function = () => void

interface CreateCancellableArgs {
  controllerName: string;
  delay: number;
  handler: Function;
}

interface CancellableCache {
  [key: string]: Function[];
}

const cancellableCache: CancellableCache = {}

export const createCancellable = ({
  controllerName,
  delay,
  handler,
}: CreateCancellableArgs): Function[] => {
  const create = (): Function[] => {
    let isCancelled = false

    const method = debounce(() => {
      if (isCancelled) {
        return
      }

      handler()
    }, delay)

    const cancel = (): void => {
      isCancelled = true
    }

    const reset = (): void => {
      isCancelled = false
    }

    return [method, cancel, reset]
  }

  if (!(controllerName in cancellableCache)) {
    cancellableCache[controllerName] = create()
  }

  return cancellableCache[controllerName]
}

interface CheckerCache {
  [key: string]: Function;
}

const checkerCache: CheckerCache = {}

interface CreateCheckerArgs {
  controllerName: string;
  delay: number;
  check: () => boolean;
  complete: Function;
}

export const createChecker = ({
  controllerName,
  delay,
  check,
  complete,
}: CreateCheckerArgs): Function => {
  const create = (): Function => {
    return debounce(() => {
      if (check()) {
        complete()
      }
    }, delay)
  }

  if (!(controllerName in checkerCache)) {
    checkerCache[controllerName] = create()
  }

  return checkerCache[controllerName]
}
