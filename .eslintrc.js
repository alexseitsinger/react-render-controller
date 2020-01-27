const path = require("path")

const typescriptConfig = require("./.eslintrc-typescript")
const packageConfig = require("./.eslintrc-package")
const markdownConfig = require("./.eslintrc-markdown")

module.exports = {
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
  plugins: [
    "node",
    "import",
    "simple-import-sort",
    "react",
    "jest",
    "jest-formatting",
  ],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/simple-import-sort",
    "@alexseitsinger/eslint-config/react",
    "@alexseitsinger/eslint-config/jest",
    "@alexseitsinger/eslint-config/jest-formatting",
    "prettier",
    "prettier/babel",
    "prettier/react",
  ],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      ...typescriptConfig,
    },
    {
      files: ["package.json"],
      ...packageConfig,
    },
    {
      files: ["*.md"],
      ...markdownConfig,
    },
  ],
}
