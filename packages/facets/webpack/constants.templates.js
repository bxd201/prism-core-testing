const path = require('path')
const constants = require('./constants')

const srcTemplatesDir = 'src-templates'
const srcTemplatesPath = path.join(constants.rootPath, srcTemplatesDir)
const templateIndexEntryPointName = 'templateIndex'
const templateIndexPath = path.join(srcTemplatesPath, '/index/index.jsx')
const templatesDistDir = 'prism-templates'
const templatesDistPath = path.join(constants.distPath, templatesDistDir)

module.exports = {
  srcTemplatesDir,
  srcTemplatesPath,
  templateIndexEntryPointName,
  templateIndexPath,
  templatesDistDir,
  templatesDistPath
}
