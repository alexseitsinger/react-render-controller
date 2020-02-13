import { isEqual } from "underscore"

import { RenderControllerSkippedPathname } from "src/RenderControllerWithContext"
import { debugMessage } from "src/utils/debug"

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
  prefix: string,
  passed: RenderControllerSkippedPathname[],
  currentPathname: string
): FinalSkippedPathname[] {
  /**
   * Create a new array to use.
   */
  let final: FinalSkippedPathname[] = []
  if (prefix in cached) {
    final = [...cached[prefix]]
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
  if (prefix in cached) {
    const current = cached[prefix]
    if (isEqual(current, final)) {
      debugMessage(
        `Using cached skipped pathnames for '${prefix}' to prevent redundant references.`
      )
      return current
    }
  }

  /**
   * Otherwise, save this final array to our local store so it can be re-used
   * again by child controllers.
   */
  cached[prefix] = final
  debugMessage(
    `Saving a copy of skipped pathnames for '${prefix}', so each child render controller can inherit them`
  )

  /**
   * Return it for use in the current controller.
   */
  return final
}

export const clearSkippedPathnames = (prefix: string): void => {
  if (prefix in cached) {
    debugMessage(`Clearing cached skipped pathnames for '${prefix}'`)
    delete cached[prefix]
  }
}
