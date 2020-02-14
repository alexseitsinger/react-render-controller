const isDevelopment = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isBrowser = typeof window !== "undefined"

/**
 * 0: none
 * 1: progress
 * 2: progress + assertions/confirmations
 * 3: progress + assertions/confirmations + exceptions/resets
 */
type Levels = 0 | 1 | 2 | 3

interface DebugLevels {
  controller: Levels;
  counting: Levels;
  completing: Levels;
  loading: Levels;
  unloading: Levels;
  mounting: Levels;
  pathnames: Levels;
}

interface Config {
  debugLevels: DebugLevels;
}

let config: Config = {
  debugLevels: {
    counting: 0,
    completing: 0,
    loading: 0,
    unloading: 0,
    mounting: 0,
    pathnames: 0,
    controller: 0,
  },
}

export const setConfig = (newConfig: Config): void => {
  config = {
    ...config,
    ...newConfig,
  }
}

interface DebugMessage {
  text: string;
  level: Levels;
}

/**
 * Restrict our debug messages so that we dont pollute server-side logs.
 */
function debugMessageFactory(packageName: string) {
  return (sectionName: keyof DebugLevels) => {
    return ({ text, level }: DebugMessage): void => {
      const configLevel = config.debugLevels[sectionName]
      const isEnabled = configLevel >= level
      if (isEnabled) {
        const prefix = `[${packageName}]`
        const suffix = `[${sectionName}]`
        if ((isBrowser && isDevelopment) || isTest) {
          console.log(`${prefix}-${suffix} ${text}`)
        }
      }
    }
  }
}

const debugMessage = debugMessageFactory("render-controller")

export const completingMessage = debugMessage("completing")
export const countingMessage = debugMessage("counting")
export const loadingMessage = debugMessage("loading")
export const unloadingMessage = debugMessage("unloading")
export const mountingMessage = debugMessage("mounting")
export const pathnamesMessage = debugMessage("pathnames")
export const controllerMessage = debugMessage("controller")
