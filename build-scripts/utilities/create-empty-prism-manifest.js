const fs = require('fs')
const path = require('path')
const constants = require('../../webpack/constants')

const filePath = constants.embedWorkingPath
const fileName = constants.manifestNamePrism
const fullPath = path.join(filePath, fileName)

// make path to file
if (!fs.existsSync(filePath)) {
  console.log('Attempting to create path to prism manifest...')
  fs.mkdirSync(filePath, { recursive: true })
}

// make dummy embed.js
if (!fs.existsSync(fullPath)) {
  console.log('Creating empty prism manifest file...')
  fs.closeSync(fs.openSync(fullPath, 'w'))
  fs.writeFileSync(fullPath, '{}')
}
