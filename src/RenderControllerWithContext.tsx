import React, { ReactElement } from "react"
import { isArray } from "underscore"

import { RenderController, RenderControllerTarget } from "./RenderController"
import { Context, RenderControllerRenderProps } from "./RenderControllerContext"
import { ChildrenType, RenderFunctionType } from "./types"
import { isDefined } from "./utils/general"
import { FinalSkippedPathname, getSkippedPathnames } from "./utils/pathnames"

export interface RenderControllerSkippedPathname {
  url: string;
  reverse?: boolean;
}

export interface RenderControllerWithContextInitialProps {
  children?: ChildrenType;
  renderWith?: RenderFunctionType;
  renderWithout?: RenderFunctionType;
  renderFirst?: RenderFunctionType;
  targets: RenderControllerTarget[];
  controllerName: string;
}

export type RenderControllerWithContextProps = RenderControllerWithContextInitialProps &
  RenderControllerRenderProps & {
    skippedPathnames?: RenderControllerSkippedPathname[],
  }

export function RenderControllerWithContext(
  props: RenderControllerWithContextProps
): ReactElement {
  const { skippedPathnames, controllerName } = props

  return (
    <Context.Consumer>
      {({ onRenderFirst, onRenderWithout, getPathnames }): ReactElement => {
        const { lastPathname, currentPathname } = getPathnames()

        /**
         * Ensure we always pass an array, empty or not, for the passed
         * skippedPathnames.
         */
        let defaultSkippedPathnames: RenderControllerSkippedPathname[] = []
        if (isDefined(skippedPathnames) && isArray(skippedPathnames)) {
          defaultSkippedPathnames = [...skippedPathnames]
        }

        /**
         * Combine skipped pathnames from parent controllers.
         */
        const finalSkippedPathnames: FinalSkippedPathname[] = getSkippedPathnames(
          controllerName,
          defaultSkippedPathnames,
          currentPathname
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
