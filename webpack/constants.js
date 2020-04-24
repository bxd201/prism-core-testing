const path = require('path')

// flags
const mode = process.env.NODE_ENV || 'development'
const dev = mode === 'development'
const production = mode === 'production'

// wrapping classes
const cleanslateWrappingClass = 'c8e'
const prismWrappingClass = 'p3m'

// paths
const rootPath = path.resolve(__dirname, '..')
const srcPath = path.join(rootPath, 'src')
const distPath = path.join(rootPath, 'dist')
const nodeModulesPath = path.join(rootPath, 'node_modules')
const mocksPath = path.join(rootPath, '__mocks__')

// entry file paths
const appIndexPath = path.join(srcPath, 'bundle.js')
const authorPath = path.join(srcPath, 'author.js')
const embedPath = path.join(srcPath, 'embed.js')
const exportPath = path.join(srcPath, 'export.js')
const templateIndexPath = path.join(srcPath, '/index/index.jsx')
const cleanslatePath = path.join(srcPath, '/cleanslate/cleanslate.js')

const templateIndexEntryPointName = 'index'
const mainEntryPointName = 'bundle'
const embedEntryPointName = 'embed'
const authorEntryPointName = 'author'
const cleanslateEntryPointName = 'cleanslate'
const exportEntryPointName = 'index'
const chunkReactName = 'commonR'
const chunkNonReactName = 'commonNonR'

const fixedEntryPoints = {
  [cleanslateEntryPointName]: cleanslatePath,
  [templateIndexEntryPointName]: templateIndexPath
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
  FastMaskSimple: path.join(srcPath, 'components/Facets/FastMaskSimple/FastMaskSimple.jsx'),
  tinter: path.join(srcPath, 'components/Facets/Tinter/Tinter.jsx'),
  prism: path.join(srcPath, 'components/Facets/Prism/Prism.jsx'),
  colorDetailsFacet: path.join(srcPath, 'components/Facets/ColorDetailsFacet.jsx'),
  RoomTypeDetector: path.join(srcPath, 'components/Facets/RoomTypeDetector/RoomTypeDetector.jsx')
}

module.exports = {
  appIndexPath,
  authorEntryPointName,
  authorPath,
  chunkNonReactName,
  chunkReactName,
  cleanslateEntryPointName,
  cleanslateWrappingClass,
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
  prismWrappingClass,
  production,
  rootPath,
  srcPath,
  templateIndexEntryPointName
}
