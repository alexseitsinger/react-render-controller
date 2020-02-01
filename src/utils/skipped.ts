import { isArray, isEqual, uniq } from "underscore"

import { SkippedPathname } from "src/types"

export interface MappedPathnames {
  [key: string]: SkippedPathname[];
}

const mapped: MappedPathnames = {}

export const getSkippedPathnames = (
  prefix: string,
  passed: SkippedPathname[]
): SkippedPathname[] => {
  /**
   * Create a new array to use.
   */
  let final: SkippedPathname[] = []
  if (prefix in mapped) {
    final = [...mapped[prefix]]
  }
  if (passed !== undefined && isArray(passed) && passed.length > 0) {
    final = [...final, ...passed]
  }

  /**
   * Remove duplicates.
   */
  final = uniq(final)

  /**
   * If we already have the same values saved already, just re-use that array
   * instead of creating and saving this new one.
   */
  if (prefix in mapped) {
    const current = mapped[prefix]
    if (isEqual(current, final)) {
      return current
    }
  }

  /**
   * Otherwise, save this final array to our local store so it can be re-used
   * again by child controllers.
   */
  mapped[prefix] = final

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
