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

export const debugMessage = (message: string): void => {
  if (process.env.NODE_ENV === "development") {
    if (config.debugMessages) {
      console.log(message)
    }
  }
}
