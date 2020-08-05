const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const flags = require('./constants')
const webpack = require('webpack')
const alias = require('./partial.resolve.alias')
const stats = require('./partial.stats')
const optimization = require('./partial.optimization')
const moduleRuleJsx = require('./partial.module.rules.jsx')

// define embed dev server origin
process.env.EMBED_LOCAL_PROTOCOL = process.env.EMBED_LOCAL_PROTOCOL || 'https'
process.env.EMBED_LOCAL_HOST = process.env.EMBED_LOCAL_HOST || 'localhost'
process.env.EMBED_LOCAL_PORT = process.env.EMBED_LOCAL_PORT || '8081'
process.env.EMBED_LOCAL_ORIGIN = `${process.env.EMBED_LOCAL_PROTOCOL}://${process.env.EMBED_LOCAL_HOST}${process.env.EMBED_LOCAL_PORT ? `:${process.env.EMBED_LOCAL_PORT}` : ''}`// default local URL to localhost

// create constants that correlate to environment variables to be injected
const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const DEFINED_VARS = {
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': '',
  'ENV': ENV,
  'WEBPACK_CONSTANTS': flags
}

module.exports = {
  name: 'prismEmbed',
  stats: stats,
  target: 'web',
  watch: false,
  cache: !flags.production,
  devtool: false,
  context: flags.rootPath,
  mode: flags.mode,
  entry: {
    [flags.embedEntryPointName]: flags.embedPath
  },
  output: {
    path: path.join(flags.rootPath, 'embed-output'),
    filename: '[name].js',
    globalObject: 'self'
  },
  resolve: {
    symlinks: false,
    alias: alias
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: flags.nodeModulesPath,
        resolve: {
          mainFields: ['module', 'jsnext:main', 'browser', 'main']
        }
      },
      moduleRuleJsx
    ]
  },
  optimization: optimization,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'embed-output',
        to: '../dist',
        context: flags.rootPath,
        noErrorOnMissing: true
      }
    ]),
    new webpack.DefinePlugin(Object.entries(DEFINED_VARS).reduce((last, next) => ({ ...last, [next[0]]: JSON.stringify(next[1]) }), {}))
  ]
}
