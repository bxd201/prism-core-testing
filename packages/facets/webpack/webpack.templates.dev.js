const envVars = require('./constants.env-vars')

// define templates dev server origin
require('./partial.setup.defineLocalPaths.templates')

const WebpackBar = require('webpackbar')
const { merge } = require('webpack-merge')
const flags = require('./constants')
const common = require('./webpack.templates.common.js')

module.exports = merge(common, {
  mode: flags.mode,
  plugins: [
    require('./partial.plugins.analyzeBundle').analyzeBundle,
    new WebpackBar()
  ].filter(Boolean),
  devServer: {
    allowedHosts: 'all',
    host: process.env[envVars.TEMPLATES_LOCAL_HOST],
    server: process.env[envVars.TEMPLATES_LOCAL_PROTOCOL] ?? 'https',
    port: process.env[envVars.TEMPLATES_LOCAL_PORT],
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    devMiddleware: {
      index: true,
      writeToDisk: true
    }
  }
})
