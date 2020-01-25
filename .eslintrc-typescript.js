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
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
      jest: {
        jestConfigFile: path.resolve("./jest.config.js"),
      },
      webpack: {
        config: path.resolve("./webpack.config.dev.js"),
      },
    },
  },
  plugins: [
    "node",
    "import",
    "react",
    "jest",
    "jest-formatting",
    "@typescript-eslint/eslint-plugin",
  ],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/react",
    "@alexseitsinger/eslint-config/jest",
    "@alexseitsinger/eslint-config/jest-formatting",
    "@alexseitsinger/eslint-config/typescript-eslint",
  ],
}
