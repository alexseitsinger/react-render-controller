# RenderController

Renders a component after its data has been loaded.

## Installation

```
yarn add @alexseitsinger/react-render-controller
```

## Props

1. __controllerName__ - The name of the controller
2. __targets__ - An array of objects with the Target shape (shown below).
3. __lastPathname__ - The last pathname used by the router.
4. __currentPathname__ - The current pathname used by the router.
5. __skippedPathnames__ - An array of pathname objects used to determine when
   unloading data should be skipped. (See shape below)
6. __renderFirst__ - The function used to render output before data loading is
attempted.
7. __renderWith__ - The function used to render the output once the data has
been loaded.
8. __renderWithout__ - The function used to render the output when data loading
failed to produce non-empty result.

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
          {Object.keys(dates).map(key => {
            return (
                  <div>{key}</div>
            )
          })}
        </div>
      )}
      renderWithout={() => <FailedScreen />}
    />
  )
}
```
