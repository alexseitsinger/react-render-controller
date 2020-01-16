const path = require("path")

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "import",
    "react",
    "jest",
    "jest-formatting",
    "node",
  ],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/react",
    "@alexseitsinger/eslint-config/jest",
    "@alexseitsinger/eslint-config/jest-formatting",
    "@alexseitsinger/eslint-config/typescript-eslint",
  ],
}
