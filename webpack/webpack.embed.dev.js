const envVars = require('./constants.env-vars')

// define embed prism server origin
require('./partial.setup.defineLocalPaths.prism')

// define embed dev server origin
require('./partial.setup.defineLocalPaths.embed')

console.assert(process.env[envVars.PRISM_LOCAL_ORIGIN] !== process.env[envVars.EMBED_LOCAL_ORIGIN], 'ERROR: Prism and Prism Embed local dev servers must not be identical.')

const WebpackBar = require('webpackbar')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const merge = require('webpack-merge')
const flags = require('./constants')
const common = require('./webpack.embed.common.js')

module.exports = merge.smart(common, {
  mode: flags.mode,
  plugins: [
    new WebpackBar(),
    flags.dev && new BundleAnalyzerPlugin({
      analyzerPort: 'auto'
    })
  ],
  devServer: {
    index: '',
    host: process.env[envVars.EMBED_LOCAL_HOST],
    https: process.env[envVars.EMBED_LOCAL_PROTOCOL] === 'https',
    port: process.env[envVars.EMBED_LOCAL_PORT],
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    writeToDisk: true,
    disableHostCheck: true
  }
})
