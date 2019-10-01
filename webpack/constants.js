const path = require('path')

// flags
const mode = process.env.NODE_ENV || 'development'
const dev = mode === 'development'
const production = mode === 'production'

// paths
const rootPath = path.resolve(__dirname, '..')
const srcPath = path.join(rootPath, 'src')
const distPath = path.join(rootPath, 'dist')
const nodeModulesPath = path.join(rootPath, 'node_modules')
const mocksPath = path.join(rootPath, '__mocks__')

// entry file paths
const appIndexPath = path.join(srcPath, 'index.jsx')
const authorPath = path.join(srcPath, 'author.js')
const embedPath = path.join(srcPath, 'embed.js')

module.exports = {
  dev,
  appIndexPath,
  authorPath,
  distPath,
  embedPath,
  mocksPath,
  mode,
  nodeModulesPath,
  production,
  rootPath,
  srcPath
}
