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
const exportPath = path.join(srcPath, 'export.js')
const cleanslatePath = path.join(srcPath, '/cleanslate/cleanslate.js')

const mainEntryPointName = 'bundle'
const embedEntryPointName = 'embed'
const authorEntryPointName = 'author'
const cleanslateEntryPointName = 'cleanslate'
const exportEntryPointName = 'index'

const fixedEntryPoints = {
  [cleanslateEntryPointName]: cleanslatePath
}

const mainEntryPoints = {
  [authorEntryPointName]: authorPath,
  [embedEntryPointName]: embedPath,
  [mainEntryPointName]: appIndexPath,
  [exportEntryPointName]: exportPath
}

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in export.js and allFacets.js until further notice
 */
const facetEntryPoints = {
  colorListingPage: path.join(srcPath, 'components/Facets/ColorListingPage/ColorListingPage.jsx'),
  colorWallFacet: path.join(srcPath, 'components/Facets/ColorWallFacet.jsx'),
  colorFamilyFacet: path.join(srcPath, 'components/Facets/ColorFamilyFacet/ColorFamilyFacet.jsx'),
  tinter: path.join(srcPath, 'components/Facets/Tinter/Tinter.jsx'),
  prism: path.join(srcPath, 'components/Facets/Prism/Prism.jsx'),
  colorDetailsFacet: path.join(srcPath, 'components/Facets/ColorDetailsFacet.jsx')
}

module.exports = {
  appIndexPath,
  authorEntryPointName,
  authorPath,
  cleanslateEntryPointName,
  dev,
  distPath,
  embedEntryPointName,
  embedPath,
  facetEntryPoints,
  fixedEntryPoints,
  mainEntryPointName,
  mainEntryPoints,
  mocksPath,
  mode,
  nodeModulesPath,
  production,
  rootPath,
  srcPath
}
