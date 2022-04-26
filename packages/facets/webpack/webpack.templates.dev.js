const envVars = require('./constants.env-vars')

// define templates dev server origin
require('./partial.setup.defineLocalPaths.templates')

const WebpackBar = require('webpackbar')
const merge = require('webpack-merge')
const flags = require('./constants')
const common = require('./webpack.templates.common.js')

module.exports = merge.smart(common, {
  mode: flags.mode,
  plugins: [
    require('./partial.plugins.analyzeBundle').analyzeBundle,
    new WebpackBar()
  ].filter(Boolean),
  devServer: {
    index: 'index.html',
    host: process.env[envVars.TEMPLATES_LOCAL_HOST],
    https: process.env[envVars.TEMPLATES_LOCAL_PROTOCOL] === 'https',
    port: process.env[envVars.TEMPLATES_LOCAL_PORT],
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    writeToDisk: true,
    disableHostCheck: true,
    stats: {
      ...require('./partial.devServer.stats')
    }
  }
})