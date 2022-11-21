const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://localhost:8080/prism-templates/templates/',
    defaultCommandTimeout: 6000,
    viewportHeight: 800,
    viewportWidth: 1280
  },
  env: {
    wait_time: 100 // set cy.wait() time
  }
})
