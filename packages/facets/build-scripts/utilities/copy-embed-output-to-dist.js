const move = require('glob-move')
const path = require('path')
const constants = require('../../webpack/constants')

console.info('Moving contents of embed-output to dist...')
move(path.join(constants.embedOutputPath, '*'), constants.distPath)
  .then(() => console.info('Contents of embed-output moved successfully!'))
  .catch(console.error)
