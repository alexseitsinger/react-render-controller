import React, { ReactElement } from "react"
import { isArray } from "underscore"

import {
  RenderController,
  RenderControllerSkippedPathname,
  RenderControllerTarget,
} from "src/RenderController"
import {
  Context,
  RenderControllerRenderProps,
} from "src/RenderControllerContext"
import { ChildrenType, RenderFunctionType } from "src/types"
import { getSkippedPathnames } from "src/utils/skipped"

export type RenderControllerWithContextProps = {
  children?: ChildrenType,
  renderWith?: RenderFunctionType,
  renderWithout?: RenderFunctionType,
  renderFirst?: RenderFunctionType,
  skippedPathnames?: RenderControllerSkippedPathname[],
  targets: RenderControllerTarget[],
  controllerName: string,
} & RenderControllerRenderProps

export function RenderControllerWithContext(
  props: RenderControllerWithContextProps
): ReactElement {
  const { skippedPathnames, controllerName } = props
  /**
   * Ensure we always pass an array, empty or not, for the passed
   * skippedPathnames.
   */
  let passedSkippedPathnames: RenderControllerSkippedPathname[] = []
  if (skippedPathnames !== undefined && isArray(skippedPathnames) === true) {
    passedSkippedPathnames = [...skippedPathnames]
  }

  return (
    <Context.Consumer>
      {({ onRenderFirst, onRenderWithout, getPathnames }): ReactElement => {
        const { lastPathname, currentPathname } = getPathnames()
        /**
         * Combine skipped pathnames from parent controllers.
         */
        const finalSkippedPathnames = getSkippedPathnames(
          controllerName,
          passedSkippedPathnames
        )

        /**
         * Add any skippedPathnames explicitly passed in props after, so they
         * override anything we inherit from parent controllers.
         */
        return (
          <RenderController
            {...props}
            skippedPathnames={finalSkippedPathnames}
            onRenderFirst={onRenderFirst}
            onRenderWithout={onRenderWithout}
            lastPathname={lastPathname}
            currentPathname={currentPathname}
          />
        )
      }}
    </Context.Consumer>
  )
}
