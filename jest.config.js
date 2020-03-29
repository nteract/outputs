module.exports = {
  transform: {
    "^.+\\.js?$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.base.json",
      isolatedModules: true
    }
  },
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/.*types\\.tsx?"],
  setupFilesAfterEnv: ["./scripts/test-setup.js"],
  transformIgnorePatterns: ["node_modules/(?!@jupyter-widgets)"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/scripts/noop-module.js"
  }
};
