const deleteFolderRecursive = require('./fs-utils').deleteFolderRecursive
const constants = require('../../webpack/constants')

console.log('Clearing embed-output directory...')
deleteFolderRecursive(constants.embedOutputPath)
console.log('Successfully cleared embed-output directory!')

console.log('Clearing embed-working directory...')
deleteFolderRecursive(constants.embedWorkingPath)
console.log('Successfully cleared embed-working directory!')
