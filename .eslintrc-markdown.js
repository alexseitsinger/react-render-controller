module.exports = {
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
  },
  plugins: ["node", "react", "import", "markdown"],
  extends: [
    "@alexseitsinger/eslint-config/eslint",
    "@alexseitsinger/eslint-config/node",
    "@alexseitsinger/eslint-config/react",
    "@alexseitsinger/eslint-config/import",
    "@alexseitsinger/eslint-config/markdown",
  ],
}
