const fs = require('fs')
const path = require('path')
const constants = require('../../webpack/constants')

const filePath = path.join(constants.rootPath, 'snapshots.js')

if (fs.existsSync(filePath)) {
  console.log('Attempting to reset contents of snapshots.js...')
  fs.writeFileSync(filePath, 'module.exports = {}')
}