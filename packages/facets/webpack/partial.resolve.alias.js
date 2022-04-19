const path = require('path')

module.exports = {
  constants: path.resolve(__dirname, '../src/constants/'),
  config: path.resolve(__dirname, '../src/config/'),
  embedWorking: path.resolve(__dirname, '../embed-working/'),
  embedOutput: path.resolve(__dirname, '../embed-output/'),
  srcEmbed: path.resolve(__dirname, '../src-embed/'),
  srcTemplates: path.resolve(__dirname, '../src-templates/'),
  src: path.resolve(__dirname, '../src/'),
  __mocks__: path.resolve(__dirname, '../__mocks__/'),
  variables: path.resolve(__dirname, '../src/shared/variablesExport.js')
}
