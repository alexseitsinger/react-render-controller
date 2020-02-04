import { isArray, isFunction, isObject } from "underscore"

import {
  RenderControllerPathnames,
  RenderControllerSkippedPathname,
  RenderControllerTarget,
} from "src/RenderController"
import { debugMessage } from "src/utils/debug"

import { resetLoadCount } from "./counting"
import {
  getControllerTargetName,
  isMatchingPaths,
  prepareSkippedPathnames,
} from "./general"

const pathnames = {
  last: "/",
  current: "/",
}

interface Unloaders {
  [name: string]: ({ lastPathname, currentPathname }: RenderControllerPathnames) => void;
}

const unloaders: Unloaders = {}

type ShouldUnloadArgs = RenderControllerPathnames & {
  skippedPathnames: RenderControllerSkippedPathname[],
}

const shouldUnload = ({
  lastPathname,
  currentPathname,
  skippedPathnames,
}: ShouldUnloadArgs): boolean => {
  // Prepare our pathnames inc ase reverse or toEither or fromEither is  used.
  const prepared = prepareSkippedPathnames(skippedPathnames)

  // Check if any of hte prepared pathnames are skipped.
  const isSkipped = prepared
    .map((obj: RenderControllerSkippedPathname) => {
      const isLast = isMatchingPaths(obj.from, lastPathname)
      const isCurrent = isMatchingPaths(obj.to, currentPathname)
      return isLast && isCurrent
    })
    .includes(true)

  // If the pathname is labeled as skipped or its the same pathanme, then dont
  // unload.
  if (isSkipped) {
    return false
  }

  // Otherwise, do unloading.
  return true
}

interface AddUnloaderArgs {
  skippedPathnames: RenderControllerSkippedPathname[];
  handler: () => void;
  targetName: string;
}

const addUnloader = ({
  skippedPathnames,
  handler,
  targetName,
}: AddUnloaderArgs): void => {
  if (targetName in unloaders) {
    return
  }

  unloaders[targetName] = ({
    lastPathname,
    currentPathname,
  }: RenderControllerPathnames): void => {
    debugMessage(`unload() (${targetName})`)

    const should = shouldUnload({
      lastPathname,
      currentPathname,
      skippedPathnames,
    })

    if (should) {
      debugMessage(`  -> No skipped pathnames found, so unloading ${targetName}`)
      handler()
      debugMessage(`  -> No skipped patnames found, so resetting load count for ${targetName}`)
      resetLoadCount(targetName)
      debugMessage(`  -> No skipped pathnames found, so deleting unloaders for ${targetName}`)
      delete unloaders[targetName]
    }
    else {
      debugMessage(`  -> Skipped pathname was found, so unloading was prevented for ${targetName} when navigating from ${lastPathname} to ${currentPathname}`)
    }
  }
}

interface RunUnloadersArgs {
  lastPathname: string;
  currentPathname: string;
}

const runUnloaders = ({
  lastPathname,
  currentPathname,
}: RunUnloadersArgs): void => {
  // If we use multiple renderControllers on the same page, each one will invoke
  // the others unloaders unless we have this call to prevent unnecessary
  // repeated loading/unloading.
  if (pathnames.current === currentPathname) {
    debugMessage(`  -> Unloading prevented because pathname saved matches current`)
    return
  }

  const keys = Object.keys(unloaders)
  while (keys.length > 0) {
    const k = keys.shift()
    if (k !== undefined) {
      const f = unloaders[k]
      f({ lastPathname, currentPathname })
    }
  }

  // Finally, update our saved pathnames for the next unloaders to use to
  // determine if they should run or not.
  pathnames.last = lastPathname
  pathnames.current = currentPathname
}

interface StartUnloadingArgs {
  lastPathname: string;
  currentPathname: string;
  targets: RenderControllerTarget[];
  skippedPathnames: RenderControllerSkippedPathname[];
}

export const startUnloading = ({
  targets,
  lastPathname,
  currentPathname,
  skippedPathnames,
}: StartUnloadingArgs): void => {
  runUnloaders({ lastPathname, currentPathname })

  const prepareTarget = (target: RenderControllerTarget): void => {
    const targetName = getControllerTargetName({
      lastPathname,
      currentPathname,
      target,
    })

    const handler = (): void => {
      if (
        isFunction(target.setter) &&
        (isObject(target.empty) || isArray(target.empty))
      ) {
        debugMessage(`  -> Target has setter & an empty value, so emptying data for ${targetName}`)
        target.setter(target.empty)
        debugMessage(`  -> Target has a setter & an empty value, so resetting load count for ${targetName}`)
        resetLoadCount(targetName)
      }
    }

    addUnloader({
      skippedPathnames,
      handler,
      targetName,
    })
  }

  targets.forEach(prepareTarget)
}
