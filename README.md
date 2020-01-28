# RenderController

Renders a component after its data has been loaded.

## Installation

```
yarn add @alexseitsinger/react-render-controller
```

## Props

__Name__         | __Purpose__                                                                                 | __Required__ | __Default__
---              | ---                                                                                         | ---          | ---
controllerName   | The name of the controller                                                                  | Yes          | null
targets          | An array of target objects                                                                  | Yes          | null
renderFirst      | The function used to render output before the data loading is attempted                     | No           | null
renderWith       | The function used to render the output once the data has been loaded                        | No           | null
renderWithout    | The function used to render the output when data loading failed to produce non-empty result | No           | null
skippedPathnames | An array of objects that unloading should be skipped for.                                   | No           | []

#### Shapes

###### Target

```javascript
{
  name: String,
  data: Array|Object,
  getter: Function,
  setter: Function,
  empty: Object|Array,
  cached: Boolean,
}
```

###### Skipped Pathname

```javascript
{
  from: String,
  to: String,
  reverse: Boolean,
}
```

## Example

```javascript
import { RenderController } from "@alexseitsinger/react-render-controler"

function App({
  dates,
  getDates,
  setDates,
  lastPathname,
  currentPathname,
}) {
  return (
    <RenderController
      controllerName={"app"}
      targets={[
        {
          name: "dates",
          data: dates,
          getter: getDates,
          setter: setDates,
          empty: {},
          cached: true,
        },
      ]}
      lastPathname={lastPathname}
      currentPathname={currentPathname}
      skippedPathnames={[
        {
          from: "/",
          to: "/about",
          reverse: true,
        },
      ]}
      renderFirst={() => <LoadingScreen />}
      renderWith={() => (
        <div>
          {Object.keys(dates).map(key => (
            <div key={"fdsfsd"}>{key}</div>
          ))}
        </div>
      )}
      renderWithout={() => <FailedScreen />}
    />
  )
}
```
