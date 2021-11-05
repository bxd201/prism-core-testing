const path = require('path')
const envVars = require('./constants.env-vars')

// flags
const mode = process.env[envVars.NODE_ENV] || 'development'
const dev = mode === 'development'
const production = mode === 'production'

// wrapping classes
const cleanslateWrappingClass = 'c8e'
const prismWrappingClass = 'p3m'

// dir names
const dirNameDist = 'dist'
const dirNameDistJs = 'js'
const dirNameDistCss = 'css'

// paths
const rootPath = path.resolve(__dirname, '..')
const srcPath = path.join(rootPath, 'src')
const srcEmbedPath = path.join(rootPath, 'src-embed')
const distPath = path.join(rootPath, dirNameDist)
const embedWorkingPath = path.join(rootPath, 'embed-working')
const embedOutputPath = path.join(rootPath, 'embed-output')
const nodeModulesPath = path.join(rootPath, 'node_modules')
const mocksPath = path.join(rootPath, '__mocks__')
const publicPath = path.join(rootPath, 'public')

// entry file paths
const appIndexPath = path.join(srcPath, 'bundle.js')
const authorPath = path.join(srcPath, 'author.js')
const embedPath = path.join(srcEmbedPath, 'embed.js')
// const exportPath = path.join(srcPath, 'export.js')

const mainEntryPointName = 'bundle'
const embedEntryPointName = 'embed'
const authorEntryPointName = 'author'
const cleanslateEntryPointName = 'cleanslate'
// const exportEntryPointName = 'index'
const runtimeNamePrism = 'prismRuntime'
const manifestNamePrism = 'prismManifest.json'

const mainEntryPoints = {
  // [authorEntryPointName]: authorPath,
  [mainEntryPointName]: appIndexPath
  // [exportEntryPointName]: exportPath
}

/**
 * IMPORTANT!!!
 * The facets imported here need to match what is in allFacets.js until further notice
 */
const facetEntryPoints = {
  ColorDetailsFacet: path.join(srcPath, 'components/Facets/ColorDetailsFacet.jsx'),
  ColorFamilyFacet: path.join(srcPath, 'components/Facets/ColorFamilyFacet/ColorFamilyFacet.jsx'),
  ColorListingPage: path.join(srcPath, 'components/Facets/ColorListingPage/ColorListingPage.jsx'),
  ColorSearchFacet: path.join(srcPath, 'components/Facets/ColorSearchFacet/ColorSearchFacet.jsx'),
  ColorVisualizer: path.join(srcPath, 'components/Facets/ColorVisualizerWrapper/ColorVisualizerWrapper.jsx'),
  ColorWallFacet: path.join(srcPath, 'components/Facets/ColorWallFacet.jsx'),
  ColorWallChunkChipFacet: path.join(srcPath, 'components/Facets/ColorWallChunkChipFacet.jsx'),
  ColorWallDeux: path.join(srcPath, 'components/Facets/ColorWallDeux/ColorWallDeux.jsx'),
  FastMaskSimple: path.join(srcPath, 'components/Facets/FastMaskSimple/FastMaskSimple.jsx'),
  JumpStartFacet: path.join(srcPath, 'components/Facets/JumpStartFacet/JumpStartFacet.jsx'),
  RoomTypeDetector: path.join(srcPath, 'components/Facets/RoomTypeDetector/RoomTypeDetector.jsx'),
  SceneVisualizerFacet: path.join(srcPath, 'components/Facets/SceneVisualizerFacet.jsx'),
  TabbedSceneVisualizerFacet: path.join(srcPath, 'components/Facets/TabbedSceneVisualizerFacet.jsx')
}

module.exports = {
  appIndexPath,
  authorEntryPointName,
  authorPath,
  cleanslateEntryPointName,
  cleanslateWrappingClass,
  dev,
  dirNameDist,
  dirNameDistCss,
  dirNameDistJs,
  distPath,
  embedEntryPointName,
  embedOutputPath,
  embedPath,
  embedWorkingPath,
  // exportEntryPointName,
  facetEntryPoints,
  mainEntryPointName,
  mainEntryPoints,
  manifestNamePrism,
  mocksPath,
  mode,
  nodeModulesPath,
  prismWrappingClass,
  production,
  publicPath,
  rootPath,
  runtimeNamePrism,
  srcEmbedPath,
  srcPath
}
