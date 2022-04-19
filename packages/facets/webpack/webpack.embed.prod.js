const common = require('./webpack.embed.common.js')
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
      new webpack.HashedModuleIdsPlugin()
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
