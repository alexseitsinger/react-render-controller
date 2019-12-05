import { isFunction, once } from "underscore"

import {
  isMatchingPaths,
  prepareSkippedPathnames,
  getFullName,
} from "./general"
import { resetLoadCount } from "./counting"
import { resetLoadAttempted } from "./attempts"

export const pathnames = {
  last: "/",
  current: "/",
}

export const unloaders = {}

export const shouldUnload = (from, to, lastPathname, currentPathname, skippedPathnames) => {
  // Prepare our pathnames inc ase reverse or toEither or fromEither is  used.
  const prepared = prepareSkippedPathnames(skippedPathnames)

  // Check if any of hte prepared pathnames are skipped.
  const isSkippedPathname = prepared.map(obj => {
    const isTo = isMatchingPaths(obj.to, to)
    const isFrom = isMatchingPaths(obj.from, from)
    return ((isFrom === true) && (isTo === true))
  }).includes(true)

  // If the pathname is labeled as skipped or its the same pathanme, then dont
  // unload.
  if (isSkippedPathname === true) {
    return false
  }

  // Otherwise, do unloading.
  return true
}

export const addUnloader = ({
  //lastPathname,
  //currentPathname,
//  skippedPathnames,
  handler,
  name,
}) => {
  if (!(name in unloaders)) {
    console.log("adding unloader")
    unloaders[name] = once(() => {
      handler()
      //delete unloaders[name]
    })
  }

  //if (!(currentPathname in unloaders)) {
    //unloaders[currentPathname] = {}
  //}

  //const unloadersForPage = unloaders[currentPathname]
  //if (name in unloadersForPage) {
    //return
  //}

  //function targetUnloader(from, to) {
    //const should = shouldUnload(from, to, lastPathname, currentPathname, skippedPathnames)
    //if (should === true) {
      //handler()
      //resetLoadCount()
      //delete unloadersForPage[name]
    //}
  //}

  //unloadersForPage[name] = targetUnloader
}

export const runUnloaders = (from, to) => {
  console.log("running unloaders")

  // If we use multiple renderControllers on the same page, each one will invoke
  // the others unloaders unless we have this call to prevent unnecessary
  // repeated loading/unloading.
  if (pathnames.current === to) {
    console.log("pathnames.current === to")
    return
  }

  const keys = Object.keys(unloaders)
  while (keys.length) {
    unloaders[keys.shift()]()
  }

  // Ensure our unloaders are already there.
  //if (!(from in unloaders)) {
    //unloaders[from] = {}
  //}

  // To ensure that our unloaders run before we add any others, make it a
  // synchronous action by using a while loop. These are also more efficient.
  //const unloadersForPage = unloaders[from]
  //const keys = Object.keys(unloadersForPage)
  //while (keys.length) {
    //unloadersForPage[keys.shift()](from, to)
  //}

  // Finally, update our saved pathnames for the next unloaders to use to
  // determine if they should run or not.
  pathnames.last = from
  pathnames.current = to
}

/*
export const handleUnload = _.debounce((controllerName, targets, currentPathname) => {
  targets.forEach(obj => {
    if (_.isFunction(obj.unload)) {
      obj.unload()
    }

    const fullTargetName = getFullName(controllerName, obj.name)
    resetLoadCount(fullTargetName)
  })
}, 1000)
  */

export const processUnloaders = (
  controllerName,
  targets,
  lastPathname,
  currentPathname,
  skippedPathnames,
) => {
  runUnloaders(lastPathname, currentPathname)

  targets.forEach(obj => {
    addUnloader({
      lastPathname,
      currentPathname,
      skippedPathnames,
      handler: () => {
        if(isFunction(obj.unload)) {
          obj.unload()
        }
      },
      name: getFullName(controllerName, obj.name),
    })
  })
}


