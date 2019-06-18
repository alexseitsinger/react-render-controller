import _ from "underscore"

let controllers = {}

export function getController(name) {
  if(!(name in controllers)) {
    controllers[name] = {
      count: 0,
      attempted: false,
    }
  }
  return controllers[name]
}

export function getAttempted(name) {
  const controller = getController(name)
  return Boolean(controller.attempted)
}

export function setAttempted(name, bool) {
  const controller = getController(name)
  controller.attempted = Boolean(bool)
  return controller.attempted
}

export function incrementCount(name) {
  const controller = getController(name)
  controller.count = ++controller.count
  return controller.count
}

export function decrementCount(name) {
  const controller = getController(name)
  controller.count = --controller.count
  controller.count = Math.max(0, controller.count)
  return controller.count
}

export function delayCall(fn, delay) {
  const id = setTimeout(() => {
    fn()
    clearTimeout(id)
  }, delay)
}

export function isEmpty(data) {
  if (!data) {
    return true
  }
  var result = null
  if (_.isArray(data)) {
    // If its an empty array, set true
    if (_.isEmpty(data)) {
      result = true
    } else {
      // If its an array of items, re-run this fn on each item.
      data.forEach((obj) => {
        if (result) {
          return
        }
        result = isEmpty(obj)
      })
    }
  } else if (_.isObject(data)) {
    if (_.isEmpty(data)) {
      result = true
    }
  }
  return result
}
