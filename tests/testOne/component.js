import React from "react"

import { RenderController } from "../../src"
import { SuccessfulRender, FailedRender, FirstRender } from "../components"

export function Component({
  oneData,
  loadOneData,
  unloadOneData,

  twoData,
  loadTwoData,
  unloadTwoData,

  threeData,
  loadThreeData,
  unloadThreeData,
}) {
  return (
    <React.Fragment>
      <RenderController
        targets={[
          {
            name: "threeData",
            data: threeData,
            load: () => loadThreeData(),
            unload: () => unloadThreeData(),
          },
        ]}
        currentPathname={"/"}
        lastPathname={"/"}
        skippedPathnames={null}
        renderWith={() => <SuccessfulRender />}
        renderWithout={() => <FailedRender />}
        renderFirst={() => <FirstRender />}
      />
      <RenderController
        targets={[
          {
            name: "twoData",
            data: twoData,
            load: () => loadTwoData(),
            unload: () => unloadTwoData(),
          },
        ]}
        currentPathname={"/"}
        lastPathname={"/"}
        skippedPathnames={null}
        renderWith={() => <SuccessfulRender />}
        renderWithout={() => <FailedRender />}
        renderFirst={() => <FirstRender />}
      />
      <RenderController
        targets={[
          {
            name: "oneData",
            data: oneData,
            load: () => loadOneData(),
            unload: () => unloadOneData(),
          },
        ]}
        currentPathname={"/"}
        lastPathname={"/"}
        skippedPathnames={null}
        renderWith={() => <SuccessfulRender />}
        renderWithout={() => <FailedRender />}
        renderFirst={() => <FirstRender />}
      />
    </React.Fragment>
  )
}
