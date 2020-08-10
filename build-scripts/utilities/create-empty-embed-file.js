const fs = require('fs')
const path = require('path')
const constants = require('../../webpack/constants')

const filePath = constants.embedOutputPath
const fileName = 'embed.js'
const fullPath = path.join(filePath, fileName)

// make path to file
if (!fs.existsSync(filePath)) {
  console.log('Attempting to create path to prism embed file...')
  fs.mkdirSync(filePath, { recursive: true })
}

// make dummy embed.js
if (!fs.existsSync(fullPath)) {
  console.log('Creating empty prism embed file...')
  fs.closeSync(fs.openSync(fullPath, 'w'))
}
