const fs = require('fs')
const { exec } = require('child_process')
const progress = require('cli-progress')
const cypress = require('cypress')
const { merge } = require('mochawesome-merge')

exec('true', () => {
  // Sets TS only for report generation
  fs.writeFileSync('tsconfig.json', '{ "compilerOptions": { "baseUrl": "src" } }')
  const staticDir = 'dev-public/static'
  // Resets test folder
  if (fs.existsSync(staticDir)) {
    fs.rmdirSync(`${staticDir}/test`, { recursive: true })
  }
  // Generates reports
  const bar = new progress.SingleBar({}, progress.Presets.rect)
  console.log('\x1b[32m%s\x1b[0m', 'Generating test reports...')
  const testReportExecTime = fs.readFileSync('cypress/testReportExecTime.json')
  const fullBar = JSON.parse(testReportExecTime).sec + 25
  bar.start(fullBar)
  const loading = setInterval(() => {
    bar.increment()
  }, 1000)
  // Runs Cypress test
  cypress
    .run({
      quiet: true,
      reporter: 'mochawesome',
      reporterOptions: {
        consoleReporter: 'none',
        html: false,
        overwrite: false,
        quiet: true,
        reportDir: staticDir,
        reportFilename: 'test/report.json'
      }
    })
    .then((results) => {
      merge({ files: [`${staticDir}/test/*.json`] }).then((report) => {
        // Store last exec generation time
        fs.writeFileSync('cypress/testReportExecTime.json', `{ "sec": ${Math.ceil(report.stats.duration / 1000)} }`)
        // Save reports
        fs.writeFileSync(`${staticDir}/test-report.json`, JSON.stringify(report))
        clearInterval(loading)
        console.log('\x1b[32m%s\x1b[0m', 'Done!', `=> files generated on ${staticDir}/test-report`)
        fs.unlinkSync('tsconfig.json') // deletes TS
      })
    })
    .catch((err) => {
      throw err
    })
    .then(() => {
      bar.update(fullBar)
      bar.stop()
    })
})
