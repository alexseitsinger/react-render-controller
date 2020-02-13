import { debounce, isArray, isEmpty, isObject, isString } from "underscore"

import { RenderControllerTarget } from "src/RenderController"

interface GetControllerTargetNameArgs {
  target: RenderControllerTarget;
  controllerName: string;
}

export function isNullish(o?: any): boolean {
  if (typeof o === "undefined" || o === null) {
    return true
  }
  return false
}

export function isDefined(o?: any): boolean {
  if (isNullish(o)) {
    return false
  }
  return true
}

export const getControllerTargetName = ({
  controllerName,
  target,
}: GetControllerTargetNameArgs): string => {
  return `[${controllerName}]__[${target.name}]`
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

export const hasValue = (o?: any): boolean => {
  if (o === undefined || o === null) {
    return false
  }
  if (isString(o) === true) {
    return o.length > 0
  }
  if (isArray(o) === true) {
    if (o.length === 0) {
      return false
    }
    const results = o.map((e: any): boolean => hasValue(e))
    const includes = results.includes(true)
    const every = results.every((r: boolean): boolean => r === true)
    if (includes === true || every === true) {
      return true
    }
    return false
  }
  if (isObject(o) === true) {
    const keys = Object.keys(o)
    if (keys.length === 0) {
      return false
    }
    const results = keys.map((k: any): boolean => hasValue(o[k]))
    const includes = results.includes(true)
    const every = results.every((r: boolean): boolean => r === true)
    if (includes === true || every === true) {
      return true
    }
    return false
  }
  return isEmpty(o) === false
}
