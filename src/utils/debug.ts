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

const bracketCss = ["font-weight: bold"].join(";")
const messageCss = ["color: white"].join(";")
const prefixCss = ["color: white"].join(";")

function debugMessageFactory(prefix: string) {
  return (message: string): void => {
    if (config.debugMessages) {
      if (isBrowser && isDevelopment) {
        console.log(
          `%c[%c${prefix}%c] %c${message}`,
          bracketCss,
          prefixCss,
          bracketCss,
          messageCss
        )
      }
      if (isTest) {
        console.log(`[${prefix}] ${message}`)
      }
    }
  }
}

export const debugMessage = debugMessageFactory("render-controller")
