// TODO: brendan.do
// Uncomment the clean plugin when we merge back into develop since we don't want the HTML files
// going out onto production. But it needs to exist during the replatform testing.

const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const WebpackCleanPlugin = require('webpack-clean')

const common = require('./webpack.common.js')

module.exports = merge(
  common,
  {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin()
      // new WebpackCleanPlugin([
      //   'dist/index.html',
      //   'dist/embeddable.html'
      // ])
    ]
  }
)
