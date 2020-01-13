const path = require("path")

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["import", "react", "@typescript-eslint/eslint-plugin"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".js", ".jsx"],
    },
    "import/resolver": {
      webpack: {
        config: path.resolve("./webpack.config.dev.js"),
      },
    },
  },
  extends: ["@alexseitsinger/eslint-config"],
}
