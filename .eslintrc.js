const path = require("path")

module.exports = {
  root: true,
  parser: "babel-eslint",
  env: {
    "jest/globals": true,
  },
  globals: {
    describe: true,
    expect: true,
    it: true,
    test: true,
    mount: true,
    shallow: true,
    render: true,
  },
  plugins: [
    "jest",
  ],
  settings: {
    "react": {
      "version": "detect",
    },
    "import/resolver": {
      webpack: {
        config: path.resolve("./webpack.config.dev.js"),
      }
    },
  },
  extends: [
    "@alexseitsinger/eslint-config-base",
    "@alexseitsinger/eslint-config-react",
    "plugins:jest/recommended",
  ],
}
