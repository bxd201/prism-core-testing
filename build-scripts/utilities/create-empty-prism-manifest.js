const fs = require('fs')
const constants = require('../../webpack/constants')

const filePath = constants.embedWorkingPath + '/'
const fileName = constants.manifestNamePrism

// make path to file
console.log('Attempting to create path to prism manifest...')
fs.mkdirSync(filePath, { recursive: true })

// make dummy prism manifest .js
console.log('Creating empty prism manifest file...')
fs.closeSync(fs.openSync(filePath + fileName, 'w'))
