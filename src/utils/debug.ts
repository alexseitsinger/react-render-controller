const isDevelopment = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"
const isBrowser = typeof window !== "undefined"

interface Config {
  debugMessages: boolean;
}

let config: Config = {
  debugMessages: false,
}

export const setConfig = (newConfig: Config): void => {
  config = {
    ...config,
    ...newConfig,
  }
}

interface DebugMessage {
  message: string;
  sectionName?: string;
}

/**
 * Restrict our debug messages so that we dont pollute server-side logs.
 */
function debugMessageFactory(packageName: string) {
  return ({ message, sectionName }: DebugMessage): void => {
    if (config.debugMessages) {
      const prefix = `[${packageName}]`
      const suffix = sectionName !== undefined ? `[${sectionName}]` : ""
      if ((isBrowser && isDevelopment) || isTest) {
        console.log(`${prefix}-${suffix} ${message}`)
      }
    }
  }
}

export const debugMessage = debugMessageFactory("render-controller")
