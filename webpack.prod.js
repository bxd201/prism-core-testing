const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackCleanPlugin = require('webpack-clean')

const common = require('./webpack.common.js')

module.exports = merge(
  common,
  {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin('dist', {}),
      new WebpackCleanPlugin([
        'dist/index.html',
        'dist/embeddable.html'
      ])
    ]
  }
)
