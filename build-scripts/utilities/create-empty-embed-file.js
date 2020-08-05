const fs = require('fs')
const path = require('path')
const constants = require('../../webpack/constants')

const filePath = constants.embedOutputPath
const fileName = 'embed.js'

// make path to file
console.log('Attempting to create path to prism embed file...')
fs.mkdirSync(filePath, { recursive: true })

// make dummy embed.js
console.log('Creating empty prism embed file...')
fs.closeSync(fs.openSync(path.join(filePath, fileName), 'w'))
