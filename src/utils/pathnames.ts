import { isEqual } from "underscore"

import { RenderControllerSkippedPathname } from "../RenderControllerWithContext"

import { pathnamesMessage } from "./debug"

export const removeLeadingAndTrailingSlashes = (url: string): string => {
  var updated = url
  if (updated.length === 1 && updated === "/") {
    return updated
  }
  updated = updated.replace(/^\//, "")
  updated = updated.replace(/\/$/, "")
  return updated
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

export interface FinalSkippedPathname {
  from: string;
  to: string;
}

export function preparePathnames(
  skippedPathnames: RenderControllerSkippedPathname[],
  currentPathname: string
): FinalSkippedPathname[] {
  let ret: FinalSkippedPathname[] = []

  skippedPathnames.forEach((obj: RenderControllerSkippedPathname) => {
    ret = [...ret, { from: currentPathname, to: obj.url }]

    if (obj.reverse !== undefined && obj.reverse === true) {
      ret = [
        ...ret,
        {
          from: obj.url,
          to: currentPathname,
        },
      ]
    }
  })

  return getUniquePathnames(ret)
}

function getUniquePathnames(
  arr: FinalSkippedPathname[]
): FinalSkippedPathname[] {
  let seen: FinalSkippedPathname[] = []

  arr.forEach((arrObj: FinalSkippedPathname) => {
    if (
      !seen
        .map((seenObj: FinalSkippedPathname): boolean => {
          const fromMatch = seenObj.from === arrObj.from
          const toMatch = seenObj.to === arrObj.to
          return fromMatch && toMatch
        })
        .includes(true)
    ) {
      seen = [...seen, arrObj]
    }
  })

  return seen
}

interface CachedPathnames {
  [key: string]: FinalSkippedPathname[];
}

const cached: CachedPathnames = {}

export function getSkippedPathnames(
  controllerName: string,
  passed: RenderControllerSkippedPathname[],
  currentPathname: string
): FinalSkippedPathname[] {
  /**
   * Create a new array to use.
   */
  let final: FinalSkippedPathname[] = []
  if (controllerName in cached) {
    final = [...cached[controllerName]]
  }
  const prepared = preparePathnames(passed, currentPathname)
  final = [...final, ...prepared]

  /**
   * Remove duplicates.
   */
  final = getUniquePathnames(final)

  /**
   * If we already have the same values cached already, just re-use that array
   * instead of creating and saving this new one.
   */
  if (controllerName in cached) {
    const current = cached[controllerName]
    if (isEqual(current, final)) {
      pathnamesMessage({
        text: `Using cached skipped pathnames for controller '${controllerName}' to prevent redundant references.`,
        level: 2,
      })
      return current
    }
  }

  /**
   * Otherwise, save this final array to our local store so it can be re-used
   * again by child controllers.
   */
  cached[controllerName] = final
  pathnamesMessage({
    text: `Saving a copy of skipped pathnames for controller '${controllerName}', so each child controller can inherit them`,
    level: 2,
  })

  /**
   * Return it for use in the current controller.
   */
  return final
}

export const clearSkippedPathnames = (controllerName: string): void => {
  if (controllerName in cached) {
    pathnamesMessage({
      text: `Clearing cached skipped pathnames for '${controllerName}'`,
      level: 1,
    })
    delete cached[controllerName]
  }
}
