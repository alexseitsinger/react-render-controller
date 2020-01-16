const path = require("path")
const typescriptConfig = require("./.eslintrc.typescript")

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
  },
  settings: {
    "import/resolver": {
      webpack: {
        config: path.resolve("./webpack.config.dev.js"),
      },
    },
  },
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/react",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/package-json",
    "@alexseitsinger/eslint-config/jest",
    "@alexseitsinger/eslint-config/jest-formatting",
    "@alexseitsinger/eslint-config/simple-import-sort",
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      ...typescriptConfig,
    },
  ],
}
