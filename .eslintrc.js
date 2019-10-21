const path = require("path")

module.exports = {
  root: true,
  parser: "babel-eslint",
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
  ],
}
