import {
  RenderControllerPathnames,
  RenderControllerTarget,
} from "src/RenderController"
import { unloadingMessage } from "src/utils/debug"
import { FinalSkippedPathname, isMatchingPaths } from "src/utils/pathnames"

import { resetLoadCount } from "./counting"
import {
  getControllerTargetName,
} from "./general"

const pathnames = {
  last: "/",
  current: "/",
}

interface Unloaders {
  [name: string]: ({ lastPathname, currentPathname }: RenderControllerPathnames) => void;
}

const unloaders: Unloaders = {}

type ShouldUnload = RenderControllerPathnames & {
  skippedPathnames: FinalSkippedPathname[],
}

const shouldUnload = ({
  lastPathname,
  currentPathname,
  skippedPathnames,
}: ShouldUnload): boolean => {
  // Check if any of hte prepared pathnames are skipped.
  const isSkipped = skippedPathnames
    .map((obj: FinalSkippedPathname) => {
      const isLast = isMatchingPaths(obj.from, lastPathname)
      const isCurrent = isMatchingPaths(obj.to, currentPathname)
      return isLast && isCurrent
    })
    .includes(true)

  const result = !isSkipped

  unloadingMessage({
    text: `Should unload for navigating from '${lastPathname}' to '${currentPathname}'? ${result}`,
    level: 2,
  })

  return result
}

interface AddUnloader {
  skippedPathnames: FinalSkippedPathname[];
  target: RenderControllerTarget;
  controllerName: string;
}

const addUnloader = ({
  skippedPathnames,
  target,
  controllerName,
}: AddUnloader): void => {
  const targetName = getControllerTargetName({
    controllerName,
    target,
  })

  if (targetName in unloaders) {
    unloadingMessage({
      text: `Not adding unloader for target '${targetName}' because one already exists`,
      level: 3,
    })
    return
  }

  unloadingMessage({
    text: `Adding an unloader for '${targetName}'`,
    level: 1,
  })

  unloaders[targetName] = ({
    lastPathname,
    currentPathname,
  }: RenderControllerPathnames): void => {
    const should = shouldUnload({
      lastPathname,
      currentPathname,
      skippedPathnames,
    })

    if (!should) {
      unloadingMessage({
        text: `Skipping unloader for navigation from '${lastPathname}' to '${currentPathname}'`,
        level: 3,
      })
      return
    }

    unloadingMessage({
      text: `Running unloader for navigation from '${lastPathname}' to '${currentPathname}'`,
      level: 1,
    })
    delete unloaders[targetName]
    unloadingMessage({
      text: `Setting empty data for target '${targetName}'`,
      level: 3,
    })
    target.setter(target.empty)
    resetLoadCount(targetName)
  }
}

interface RunUnloaders {
  lastPathname: string;
  currentPathname: string;
}

const runUnloaders = ({
  lastPathname,
  currentPathname,
}: RunUnloaders): void => {
  // If we use multiple renderControllers on the same page, each one will invoke
  // the others unloaders unless we have this call to prevent unnecessary
  // repeated loading/unloading.
  if (pathnames.current === currentPathname) {
    unloadingMessage({
      text: "Not running unloaders because navigated to same page",
      level: 2,
    })
    return
  }

  const keys = Object.keys(unloaders)
  unloadingMessage({
    text: `Trying ${keys.length} unloaders.`,
    level: 1,
  })
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

interface StartUnloading {
  targets: RenderControllerTarget[];
  skippedPathnames: FinalSkippedPathname[];
  controllerName: string;
  lastPathname: string;
  currentPathname: string;
}

export const startUnloading = ({
  targets,
  controllerName,
  skippedPathnames,
  lastPathname,
  currentPathname,
}: StartUnloading): void => {
  runUnloaders({ lastPathname, currentPathname })

  const addNewUnloader = (target: RenderControllerTarget): void => {
    addUnloader({
      controllerName,
      target,
      skippedPathnames,
    })
  }

  targets.forEach(addNewUnloader)
}
