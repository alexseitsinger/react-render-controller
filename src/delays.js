export const runDelayAmount = 1100

var seen = []
export var runDelay = 0
export var lastRunDelay = 0

export const resetRunDelay = () => {
  seen = []
  lastRunDelay = 0
  runDelay = 0
}

export const incrementRunDelay = name => {
  if (!(name in seen)) {
    seen.push(name)
    lastRunDelay = runDelay
    runDelay += runDelayAmount
  }
  console.log("runDelay: ", runDelay)
}

export const decrementRunDelay = name => {
  if (name in seen) {
    seen.splice(seen.indexOf(name), 1)
    lastRunDelay = runDelay
    runDelay -= runDelayAmount
  }
}
