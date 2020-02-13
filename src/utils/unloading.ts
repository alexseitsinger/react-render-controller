import {
  RenderControllerPathnames,
  RenderControllerTarget,
} from "src/RenderController"
import { debugMessage } from "src/utils/debug"
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

  debugMessage(
    `Is unloading skipped for navigation from '${lastPathname}' to '${currentPathname}'? ${isSkipped}`
  )

  return !isSkipped
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
    debugMessage(
      `Not adding unloader for target '${targetName}' because one already exists`,
    )
    return
  }

  unloaders[targetName] = ({
    lastPathname,
    currentPathname,
  }: RenderControllerPathnames): void => {
    debugMessage(
      `Running an unloader for navigation from '${lastPathname}' to '${currentPathname}'`
    )
    const should = shouldUnload({
      lastPathname,
      currentPathname,
      skippedPathnames,
    })
    if (should) {
      delete unloaders[targetName]
      debugMessage(
        `Setting empty data for target '${targetName}'`,
      )
      target.setter(target.empty)
      resetLoadCount(targetName)
    }
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
    debugMessage("Not running unloaders because navigated to same page")
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
  debugMessage(
    `Starting unloading for navigation from '${lastPathname}' to '${currentPathname}'`
  )
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
