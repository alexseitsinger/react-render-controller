import { isArray, isEqual } from "underscore"

import { RenderControllerSkippedPathname } from "src/RenderController"
import { debugMessage } from "src/utils/debug"

interface MappedRenderControllerSkippedPathnames {
  [key: string]: RenderControllerSkippedPathname[];
}

const mapped: MappedRenderControllerSkippedPathnames = {}

const uniquePathnames = (
  arr: RenderControllerSkippedPathname[]
): RenderControllerSkippedPathname[] => {
  let seen: RenderControllerSkippedPathname[] = []

  arr.forEach((arrObj: RenderControllerSkippedPathname) => {
    if (
      !seen
        .map((seenObj: RenderControllerSkippedPathname): boolean => {
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

export const getSkippedPathnames = (
  prefix: string,
  passed: RenderControllerSkippedPathname[]
): RenderControllerSkippedPathname[] => {
  /**
   * Create a new array to use.
   */
  let final: RenderControllerSkippedPathname[] = []
  if (prefix in mapped) {
    final = [...mapped[prefix]]
  }
  if (passed !== undefined && isArray(passed) && passed.length > 0) {
    final = [...final, ...passed]
  }

  /**
   * Remove duplicates.
   */
  final = uniquePathnames(final)

  /**
   * If we already have the same values saved already, just re-use that array
   * instead of creating and saving this new one.
   */
  if (prefix in mapped) {
    const current = mapped[prefix]
    if (isEqual(current, final)) {
      debugMessage(`  -> Cached skippedPathnames match the newly created one, so
                   returning the cached one to prevent redundant references.
                     (${prefix})`)
      return current
    }
  }

  /**
   * Otherwise, save this final array to our local store so it can be re-used
   * again by child controllers.
   */
  mapped[prefix] = final
  debugMessage(`  -> Saving a copy of the skippedPathnames for re-use by child
               controllers. (${prefix})`)

  /**
   * Return it for use in the current controller.
   */
  return final
}

export const clearSkippedPathnames = (prefix: string): void => {
  if (prefix in mapped) {
    delete mapped[prefix]
  }
}
