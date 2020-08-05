// define embed dev server origin

process.env.EMBED_LOCAL_PROTOCOL = process.env.EMBED_LOCAL_PROTOCOL || 'https'
process.env.EMBED_LOCAL_HOST = process.env.EMBED_LOCAL_HOST || 'localhost'
process.env.EMBED_LOCAL_PORT = process.env.EMBED_LOCAL_PORT || '8081'
process.env.EMBED_LOCAL_ORIGIN = `${process.env.EMBED_LOCAL_PROTOCOL}://${process.env.EMBED_LOCAL_HOST}${process.env.EMBED_LOCAL_PORT ? `:${process.env.EMBED_LOCAL_PORT}` : ''}`// default local URL to localhost

console.assert(process.env.PRISM_LOCAL_ORIGIN !== process.env.EMBED_LOCAL_ORIGIN, 'ERROR: Prism and Prism Embed local dev servers must not be identical.')

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
    host: process.env.EMBED_LOCAL_HOST,
    https: process.env.EMBED_LOCAL_PROTOCOL === 'https',
    port: process.env.EMBED_LOCAL_PORT,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    writeToDisk: true,
    disableHostCheck: true
  }
})
