module.exports = {
  setupFilesAfterEnv: ['<rootDir>/setup/jestPuppeteerSetupAfterEnv.js'],
  // Do not exclude utils and constants in testPathIgnorePatterns, it will not import them !!!
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/unit',
    '<rootDir>/__tests__/components',
    '<rootDir>/__tests__/shared'],
  // Puppeeteer setup
  globalSetup: '<rootDir>/setup/puppeteerSetupFile.js',
  globalTeardown: '<rootDir>/setup/puppeteerTeardown.js',
  testEnvironment: '<rootDir>/setup/puppeteerEnv.js'
}
