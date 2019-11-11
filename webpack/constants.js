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
const cleanslatePath = path.join(srcPath, 'cleanslate.js')

const mainEntryPointName = 'bundle'
const mainEntryPointPath = appIndexPath

const mainEntryPoints = {
  [mainEntryPointName]: mainEntryPointPath,
  embed: embedPath
}

const facetEntryPoints = {
  colorListingPage: path.join(srcPath, 'components/Facets/ColorListingPage/ColorListingPage.jsx'),
  colorWallFacet: path.join(srcPath, 'components/Facets/ColorWallFacet/ColorWallFacet.jsx'),
  tinter: path.join(srcPath, 'components/Facets/Tinter/Tinter.jsx'),
  prism: path.join(srcPath, 'components/Facets/Prism/Prism.jsx'),
  colorDetails: path.join(srcPath, 'components/Facets/ColorDetails/ColorDetails.jsx')
}

module.exports = {
  appIndexPath,
  authorPath,
  cleanslatePath,
  dev,
  distPath,
  embedPath,
  facetEntryPoints,
  mainEntryPointName,
  mainEntryPointPath,
  mainEntryPoints,
  mocksPath,
  mode,
  nodeModulesPath,
  production,
  rootPath,
  srcPath
}
