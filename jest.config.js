module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  setupFiles: ["./jest.setup.js"],
  moduleNameMapper: {
    "^[~@$]?[tT]ests(.*)$": "<rootDir>/tests$1",
    "^[~@$]?[sS]rc(.*)$": "<rootDir>/src$1",
  },
  transform: {
    "\\.tsx?$": "ts-jest",
    "\\.jsx?$": "babel-jest",
  },
  testMatch: ["<rootDir>/tests/*.test.{ts,tsx}"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.jest.json",
    },
  },
}
