const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
  },
  setupFiles: ['path/to/setupEnv.js'],
};
module.exports = {
  testTimeout: 20000,
};
