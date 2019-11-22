import _ from "underscore"

import {
  getFullName,
  isEmpty,
} from "./general"
import {
  getLoadCount,
  updateLoadCount,
} from "./counting"

export const runLoadersDelay = 1100

export const loaders = {}

let kickedOff = []
const clearKickedOff = _.debounce(() => {
  kickedOff = []
}, 3000)

export const kickoff = (name, f) => {
  const i = kickedOff.indexOf(name)
  if (i < 0) {
    kickedOff.push(name)
    f()
  }
}

const clearLoaders = _.debounce(() => {
  Object.keys(loaders).forEach(key => {
    delete loaders[key]
  })
}, 2000)

export const addLoader = (name, handler, callback) => {
  var isLoadCancelled = false

  if (!(name in loaders)) {
    loaders[name] = _.once(() => {
      //delete loaders[name]
      if (isLoadCancelled === true) {
        return
      }
      handler()
      callback()
      updateLoadCount(name)
    })
  }

  return () => {
    isLoadCancelled = true
  }
}

export const startRunningLoaders = () => {
  Object.keys(loaders).forEach(key => {
    loaders[key]()
  })
  clearLoaders()
}

export const hasTargetAttemptedLoad = fullTargetName => {
  if (getLoadCount(fullTargetName) < 0) {
    return false
  }
  return true
}

export const doesTargetHaveData = obj => {
  if (!obj.data || isEmpty(obj.data) === true) {
    return false
  }
  return true
}

export const checkTargetsLoaded = targets => {
  return targets.map(obj => doesTargetHaveData(obj)).every(b => b === true)
}

export const checkForFirstLoad = (controllerName, targets) => {
  var total = 0

  targets.forEach(obj => {
    const fullTargetName = getFullName(controllerName, obj.name)
    total += getLoadCount(fullTargetName)
  })

  if (total <= 0) {
    return true
  }
  return false
}

export const reportUnloaded = _.debounce(targets => {
  targets.forEach(obj => {
    if (doesTargetHaveData(obj) === false) {
      console.log("Failed to load: ", obj.name)
    }
  })
}, 6000)

const loadTarget = (controllerName, obj) => {
  const fullTargetName = getFullName(controllerName, obj.name)
  if (hasTargetAttemptedLoad(fullTargetName) === true) {
    return
  }

  obj.load()
}

export const processLoaders = (controllerName, targets, setCanceller) => {
  targets.forEach((obj, i, arr) => {
    if (checkTargetsLoaded(targets) === true) {
      return
    }

    const fullTargetName = getFullName(controllerName, obj.name)
    const handleLoad = () => loadTarget(controllerName, obj)

    setCanceller(fullTargetName, addLoader(fullTargetName, handleLoad, () => {
      setCanceller(fullTargetName, null)
    }))

    if (arr.length === (i + 1)) {
      startRunningLoaders()
    }
  })
}

