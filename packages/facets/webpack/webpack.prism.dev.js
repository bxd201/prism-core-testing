const envVars = require('./constants.env-vars')

// define prism dev server origin
require('./partial.setup.defineLocalPaths.prism')

// define embed dev server origin
require('./partial.setup.defineLocalPaths.embed')

// define templates dev server origin
require('./partial.setup.defineLocalPaths.templates')

console.assert(process.env[envVars.PRISM_LOCAL_ORIGIN] !== process.env[envVars.EMBED_LOCAL_ORIGIN], 'ERROR: Prism and Prism Embed local dev servers must not be identical.')

const { merge } = require('webpack-merge')
const flags = require('./constants')
const webpack = require('webpack')
const common = require('./webpack.prism.common.js')

module.exports = merge(common, {
  mode: flags.mode,
  plugins: [
    require('./partial.plugins.analyzeBundle').analyzeBundle,
    new webpack.EvalSourceMapDevToolPlugin({
      exclude: /vendor|node_modules/,
      sourceURLTemplate: module => `/${module.identifier}`,
      moduleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]',
      filename: 'dist/public/[name].js.map',
      columns: false,
      module: true
    })
  ].filter(Boolean),
  devServer: {
    allowedHosts: 'all',
    host: process.env[envVars.PRISM_LOCAL_HOST],
    port: process.env[envVars.PRISM_LOCAL_PORT],
    server: process.env[envVars.PRISM_LOCAL_PROTOCOL] ?? 'https',
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index/' },
        { from: /^\/index\/embeddable/, to: '/index/embeddable.html' }
      ]
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    devMiddleware: {
      index: true,
      writeToDisk: true
    },
    proxy: [{
      context: () => true,
      target: 'http://localhost:3000',
      secure: false,
      bypass: (req, res, proxyOptions) => {
        if (req.url.indexOf('/prism-ml') === 0 && process.env[envVars.MOCK_API]) {
          console.log('MOCKING FAST MASK AND REAL COLOR!')
          return null
        }

        return req.url
      }
    }, {
      // proxy over to embed.js dev server
      context: () => true,
      target: process.env[envVars.EMBED_LOCAL_ORIGIN],
      secure: false,
      bypass: (req, res, proxyOptions) => {
        if (req.url.indexOf('/embed.js') === 0) {
          return null
        }

        return req.url
      }
    }, {
      // proxy over to templates dev server
      context: () => true,
      target: process.env[envVars.TEMPLATES_LOCAL_ORIGIN],
      secure: false,
      bypass: (req, res, proxyOptions) => {
        if (req.url.match(/^\/(index\.html)?$/) || req.url.indexOf('/prism-templates/') === 0) {
          return null
        }

        return req.url
      }
    }]
  }
})
