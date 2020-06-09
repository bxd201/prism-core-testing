const puppeteer = require('puppeteer')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')
const os = require('os')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

module.exports = async function () {
  const browser = await puppeteer.launch({
    args: [ '--ignore-certificate-errors', '--window-size=1400,1200' ],
    headless: false,
    devtools: true,
    ignoreHTTPSErrors: true,
    // https://github.com/puppeteer/puppeteer/issues/3688
    defaultViewport: null
  })
  global.__BROWSER_GLOBAL__ = browser

  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
