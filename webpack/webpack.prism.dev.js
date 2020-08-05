// define prism dev server origin
process.env.PRISM_LOCAL_PROTOCOL = process.env.PRISM_LOCAL_PROTOCOL || 'https'
process.env.PRISM_LOCAL_HOST = process.env.PRISM_LOCAL_HOST || 'localhost'
process.env.PRISM_LOCAL_PORT = process.env.PRISM_LOCAL_PORT || '8080'
process.env.PRISM_LOCAL_ORIGIN = `${process.env.PRISM_LOCAL_PROTOCOL}://${process.env.PRISM_LOCAL_HOST}${process.env.PRISM_LOCAL_PORT ? `:${process.env.PRISM_LOCAL_PORT}` : ''}`// default local URL to localhost

// define embed dev server origin
process.env.EMBED_LOCAL_PROTOCOL = process.env.EMBED_LOCAL_PROTOCOL || 'https'
process.env.EMBED_LOCAL_HOST = process.env.EMBED_LOCAL_HOST || 'localhost'
process.env.EMBED_LOCAL_PORT = process.env.EMBED_LOCAL_PORT || '8081'
process.env.EMBED_LOCAL_ORIGIN = `${process.env.EMBED_LOCAL_PROTOCOL}://${process.env.EMBED_LOCAL_HOST}${process.env.EMBED_LOCAL_PORT ? `:${process.env.EMBED_LOCAL_PORT}` : ''}`// default local URL to localhost

// define embed dev server origin
process.env.TEMPLATES_LOCAL_PROTOCOL = process.env.TEMPLATES_LOCAL_PROTOCOL || 'https'
process.env.TEMPLATES_LOCAL_HOST = process.env.TEMPLATES_LOCAL_HOST || 'localhost'
process.env.TEMPLATES_LOCAL_PORT = process.env.TEMPLATES_LOCAL_PORT || '8082'
process.env.TEMPLATES_LOCAL_ORIGIN = `${process.env.TEMPLATES_LOCAL_PROTOCOL}://${process.env.TEMPLATES_LOCAL_HOST}${process.env.TEMPLATES_LOCAL_PORT ? `:${process.env.TEMPLATES_LOCAL_PORT}` : ''}`// default local URL to localhost

console.assert(process.env.PRISM_LOCAL_ORIGIN !== process.env.EMBED_LOCAL_ORIGIN, 'ERROR: Prism and Prism Embed local dev servers must not be identical.')

const merge = require('webpack-merge')
const flags = require('./constants')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const common = require('./webpack.prism.common.js')

module.exports = merge.smart(common, {
  mode: flags.mode,
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerPort: 'auto'
    }),
    new webpack.EvalSourceMapDevToolPlugin({
      exclude: /vendor|node_modules/,
      sourceURLTemplate: module => `/${module.identifier}`,
      moduleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]',
      filename: 'dist/public/[name].js.map',
      columns: false,
      module: true
    })
  ],
  devServer: {
    host: process.env.PRISM_LOCAL_HOST,
    port: process.env.PRISM_LOCAL_PORT,
    https: process.env.PRISM_LOCAL_PROTOCOL === 'https',
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
    writeToDisk: true,
    disableHostCheck: true,
    proxy: [{
      // proxy over to embed.js dev server
      context: () => true,
      target: process.env.EMBED_LOCAL_ORIGIN,
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
      target: process.env.TEMPLATES_LOCAL_ORIGIN,
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
