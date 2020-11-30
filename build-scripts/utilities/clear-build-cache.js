const deleteFolderRecursive = require('./fs-utils').deleteFolderRecursive
const constants = require('../../webpack/constants')

console.log('Clearing hard-source cache...')
deleteFolderRecursive('./.cache/hard-source')
console.log('Successfully cleared hard-source cache!')

console.log('Clearing terser cache...')
deleteFolderRecursive('./node_modules/.cache')
console.log('Successfully cleared terser cache!')

console.log('Emptying dist...')
deleteFolderRecursive(constants.distPath)
console.log('Successfully emptied dist directory!')
