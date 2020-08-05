// define embed dev server origin

process.env.TEMPLATES_LOCAL_PROTOCOL = process.env.TEMPLATES_LOCAL_PROTOCOL || 'https'
process.env.TEMPLATES_LOCAL_HOST = process.env.TEMPLATES_LOCAL_HOST || 'localhost'
process.env.TEMPLATES_LOCAL_PORT = process.env.TEMPLATES_LOCAL_PORT || '8082'
process.env.TEMPLATES_LOCAL_ORIGIN = `${process.env.TEMPLATES_LOCAL_PROTOCOL}://${process.env.TEMPLATES_LOCAL_HOST}${process.env.TEMPLATES_LOCAL_PORT ? `:${process.env.TEMPLATES_LOCAL_PORT}` : ''}`// default local URL to localhost

const WebpackBar = require('webpackbar')
const merge = require('webpack-merge')
const flags = require('./constants')
const common = require('./webpack.templates.common.js')

module.exports = merge.smart(common, {
  mode: flags.mode,
  plugins: [
    new WebpackBar()
  ],
  devServer: {
    index: 'index.html',
    host: process.env.TEMPLATES_LOCAL_HOST,
    https: process.env.TEMPLATES_LOCAL_PROTOCOL === 'https',
    port: process.env.TEMPLATES_LOCAL_PORT,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    writeToDisk: true,
    disableHostCheck: true
  }
})
