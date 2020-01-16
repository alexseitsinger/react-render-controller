module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "ts", "tsx", "json"],
  setupFiles: ["./jest.setup.js"],
  moduleDirectories: ["src", "tests", "node_modules"],
  moduleNameMapper: {
    "^@?[tT]ests(.*)$": "<rootDir>/tests$1",
    "^@?[sS]rc(.*)$": "<rootDir>/src$1",
  },
  transform: {
    "\\.tsx?$": "ts-jest",
  },
  testMatch: ["<rootDir>/tests/*.test.{ts,tsx}"],
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.jest.json",
    },
  },
}
