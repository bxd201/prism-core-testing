const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const { sassRules } = require('./webpack/sassRules')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const flags = require('./webpack/constants')

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const API_PATH = (process.env.API_URL) ? process.env.API_URL : '$API_URL'
const ML_API_URL = (process.env.ML_API_URL) ? process.env.ML_API_URL : '$ML_API_URL'
const BASE_PATH = (process.env.WEB_URL) ? process.env.WEB_URL : '$WEB_URL'
// This flag if positive will use Firebase anonymous login instead of MySherwin
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env.FIREBASE_AUTH_ENABLED)

module.exports = {
  stats: {
    colors: true,
    hash: true,
    timings: true,
    assets: true,
    chunks: true,
    chunkModules: true,
    modules: true,
    children: false,
    errors: true
  },
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
    filename: '[name].js',
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
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      constants: path.resolve(__dirname, 'src/constants/'),
      config: path.resolve(__dirname, 'src/config/'),
      src: path.resolve(__dirname, 'src/'),
      __mocks__: path.resolve(__dirname, '__mocks__/'),
      variables: path.resolve(__dirname, 'src/shared/variables.js')
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
      {
        test: /\.(sc|sa|c)ss$/,
        include: flags.srcPath,
        use: sassRules
      },
      {
        test: /\.worker\.js$/,
        exclude: /node_modules\/(?!react-intl|intl-messageformat|intl-messageformat-parser)/,
        include: flags.srcPath,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '.babelrc')
            }
          },
          'worker-loader'
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!react-intl|intl-messageformat|intl-messageformat-parser)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '.babelrc')
            }
          }
        ],
        resolve: { extensions: [ '.js', '.jsx' ] }
      }
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
      filename: 'css/[name].css'
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/images',
        to: 'prism/images'
      }
    ]),
    new webpack.DefinePlugin({
      'API_PATH': JSON.stringify(API_PATH),
      'APP_NAME': JSON.stringify(APP_NAME),
      'APP_VERSION': JSON.stringify(APP_VERSION),
      'BASE_PATH': JSON.stringify(BASE_PATH),
      'ML_API_URL': JSON.stringify(ML_API_URL),
      'FIREBASE_AUTH_ENABLED': FIREBASE_AUTH_ENABLED
    })
  ].filter(p => p)
}
