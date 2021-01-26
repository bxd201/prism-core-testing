const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const flags = require('./constants')
const envVars = require('./constants.env-vars')
const ALL_VARS = require('../src/shared/withBuild/variableDefs')

const alias = require('./partial.resolve.alias')
const stats = require('./partial.stats')
const moduleRuleJsx = require('./partial.module.rules.jsx')
const { sassModuleRules, sassRules } = require('./partial.module.rules.sass')

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const API_PATH = (process.env[envVars.API_URL]) ? process.env[envVars.API_URL] : '$API_URL'
const ML_API_URL = (process.env[envVars.ML_API_URL]) ? process.env[envVars.ML_API_URL] : '$ML_API_URL'
const BASE_PATH = (process.env[envVars.WEB_URL]) ? process.env[envVars.WEB_URL] : '$WEB_URL'
// This flag if positive will use Firebase anonymous login instead of MySherwin
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env[envVars.FIREBASE_AUTH_ENABLED])
const SMARTMASK_ENABLED = !!parseInt(process.env[envVars.SMARTMASK_ENABLED])
const ENV = process.env[envVars.NODE_ENV]

const DEFINED_VARS = {
  'API_PATH': API_PATH,
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': BASE_PATH,
  'ENV': ENV,
  'FIREBASE_AUTH_ENABLED': FIREBASE_AUTH_ENABLED,
  'SMARTMASK_ENABLED': SMARTMASK_ENABLED,
  'ML_API_URL': ML_API_URL,
  'WEBPACK_CONSTANTS': flags,
  'VAR_NAMES': ALL_VARS.varNames,
  'VAR_VALUES': ALL_VARS.varValues
}

module.exports = {
  stats: stats,
  target: 'web',
  watch: false,
  cache: !flags.production,
  devtool: false,
  context: flags.rootPath,
  mode: flags.mode,
  entry: {
    index: flags.mainEntryPoints['index']
  },
  output: {
    path: flags.distPath,
    filename: `${flags.dirNameDistJs}/[name].js`,
    library: 'prism',
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true
  },
  externals: {
    'react': {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    }
  },
  resolve: {
    symlinks: false,
    alias: {
      ...alias,
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
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
      sassModuleRules,
      sassRules,
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              // inline images below this threshhold
              limit: 8192,
              esModule: false,
              // the following options get passed to fallback file-loader
              name: '[name].[hash].[ext]',
              outputPath: 'images',
              publicPath: '/images/'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: !flags.production,
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false
              }
            }
          }
        ]
      },
      {
        test: /\.worker\.js$/,
        exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser))/,
        include: flags.srcPath,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '..', '.babelrc')
            }
          },
          'worker-loader'
        ]
      },
      moduleRuleJsx
    ]
  },
  optimization: {
    minimize: flags.production,
    concatenateModules: flags.production,
    flagIncludedChunks: flags.production,
    checkWasmTypes: flags.production,
    mangleWasmImports: false,
    mergeDuplicateChunks: true,
    moduleIds: 'named',
    namedChunks: true,
    namedModules: true,
    nodeEnv: flags.mode,
    noEmitOnErrors: flags.production,
    occurrenceOrder: flags.production,
    portableRecords: false,
    providedExports: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
    sideEffects: flags.production,
    usedExports: flags.production
  },
  plugins: [
    new WebpackBar(),
    new MiniCssExtractPlugin({
      filename: `${flags.dirNameDistCss}/[name].css`
    }),
    // NOTE: This is ONLY for copying over scene SVG masks, which webpack otherwise has no way of knowing about
    new CopyWebpackPlugin([
      {
        from: 'src/images-to-copy',
        to: 'prism/images'
      }
    ]),
    new webpack.DefinePlugin(Object.entries(DEFINED_VARS).reduce((last, next) => ({ ...last, [next[0]]: JSON.stringify(next[1]) }), {}))
  ].filter(p => p)
}
