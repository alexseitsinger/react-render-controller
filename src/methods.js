var loaderMethods = []
export const resetLoaderMethods = _.debounce(() => {
  loaderMethods = []
}, 15000)

export const doesLoaderMethodExist = f => {
  return loaderMethods.map(fn => fn === f).includes(true)
}
export const rememberLoaderMethod = f => {
  if (doesLoaderMethodExist(f) === false) {
    loaderMethods.push(f)
  }
}

