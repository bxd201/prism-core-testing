const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://localhost:8080/prism-templates/templates/',
    defaultCommandTimeout: 12000,
    pageLoadTimeout: 120000,
    screenshotOnRunFailure: false,
    video: false,
    viewportHeight: 800,
    viewportWidth: 1280
  },
  env: {
    wait_time: 500 // set cy.wait() time
  }
})
