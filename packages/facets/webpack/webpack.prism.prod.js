// TODO: brendan.do
// Uncomment the clean plugin when we merge back into develop since we don't want the HTML files
// going out onto production. But it needs to exist during the replatform testing.

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const common = require('./webpack.prism.common.js')
const flags = require('./constants')
const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = merge.smart(
  common,
  {
    mode: flags.mode,
    devtool: 'cheap-source-map',
    plugins: [
      new CleanWebpackPlugin()
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          extractComments: true,
          sourceMap: true, // Must be set to true if using source-maps in production
          terserOptions: {
            warnings: false,
            parse: {},
            compress: {},
            mangle: false, // Note `mangle.properties` is `false` by default.
            module: false,
            output: null,
            toplevel: false,
            nameCache: null,
            ie8: false,
            keep_classnames: true,
            keep_fnames: false,
            safari10: false
          }
        })
      ]
    }
  }
)
