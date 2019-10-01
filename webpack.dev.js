const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const flags = require('./webpack/constants')
const webpack = require('webpack')

module.exports = merge.smart(common, {
  mode: flags.mode,
  plugins: [
    new webpack.EvalSourceMapDevToolPlugin({
        exclude: /vendor|node_modules/,
        sourceURLTemplate: module => `/${module.identifier}`,
        moduleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]',
        filename: 'dist/public/[name].js.map',
        columns: false,
        module: true
      })
  ]
})
