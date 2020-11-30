const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const flags = require('./constants')
const webpack = require('webpack')
const alias = require('./partial.resolve.alias')
const stats = require('./partial.stats')
const optimization = require('./partial.optimization')
const moduleRuleJsx = require('./partial.module.rules.jsx')
const envVars = require('./constants.env-vars')

// define embed dev server origin
require('./partial.setup.defineLocalPaths.embed')

// create constants that correlate to environment variables to be injected
const ENV = process.env[envVars.NODE_ENV] ? process.env[envVars.NODE_ENV] : 'development'
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name
const BASE_PATH = (ENV === 'development') ? process.env[envVars.PRISM_LOCAL_ORIGIN] : (process.env[envVars.WEB_URL]) ? process.env[envVars.WEB_URL] : '$WEB_URL'

const DEFINED_VARS = {
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': BASE_PATH,
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
