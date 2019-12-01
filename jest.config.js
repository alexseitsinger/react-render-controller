module.exports = {
  setupFiles: ["./jest.setup.js"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  moduleNameMapper: {
    "^tests(.*)$": "<rootDir>/tests$1",
    "^src(.*)$": "<rootDir>/src$1",
  },
}
