const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const PostCssWrapper = require('postcss-wrapper-loader-w-exclude')
const { sassRules } = require('./webpack/sassRules')
const webpack = require('webpack')
const isEmpty = require('lodash/isEmpty')
const pick = require('lodash/pick')
const WebpackBar = require('webpackbar')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const flags = require('./webpack/constants')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const DEFAULT_LOCAL_URL = 'https://localhost:8080' // default local URL to localhost
const DEFAULT_ENTRY = `${flags.embedEntryPointName},${flags.mainEntryPointName}` // will build the embed and bundle entry points by default

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
const API_PATH = (process.env.API_URL) ? process.env.API_URL : '$API_URL'
const ML_API_URL = (process.env.ML_API_URL) ? process.env.ML_API_URL : '$ML_API_URL'
// TODO: removing this for now due to local env inconsistencies -- will now always default to localhost when running locally
// const BASE_PATH = (ENV === 'development') ? (process.env.LOCAL_URL ? process.env.LOCAL_URL : DEFAULT_LOCAL_URL) : (process.env.WEB_URL) ? process.env.WEB_URL : '$WEB_URL'
const BASE_PATH = (ENV === 'development') ? DEFAULT_LOCAL_URL : (process.env.WEB_URL) ? process.env.WEB_URL : '$WEB_URL'
const SPECIFIED_ENTRIES = process.env.ENTRY ? process.env.ENTRY : (ENV === 'development') ? DEFAULT_ENTRY : undefined

let allEntryPoints = {
  ...flags.mainEntryPoints,
  ...flags.facetEntryPoints
}

// if an ENTRY value has been passed...
if (SPECIFIED_ENTRIES) {
  // ... split it by comma
  const entries = SPECIFIED_ENTRIES.split(',')
  // keep only entry points specified by ENTRY
  allEntryPoints = pick(allEntryPoints, entries)
}

allEntryPoints = {
  ...allEntryPoints,
  // adding back in everything necessary after ENTRY filtering has been considered
  ...flags.fixedEntryPoints
}

// if we do not have any valid entry points...
if (isEmpty(allEntryPoints)) {
  // ... error out of the build
  throw new Error('No valid entry points specified.')
} else {
  console.info('You are attempting to build the following entry points:', Object.keys(allEntryPoints))
}

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
  entry: allEntryPoints,
  output: {
    path: flags.distPath,
    filename: '[name].js',
    globalObject: 'self'
  },
  resolve: {
    symlinks: false,

    alias: {
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
        include: flags.srcPath,
        use: [ 'babel-loader', 'worker-loader' ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [ 'babel-loader', 'eslint-loader' ],
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
    moduleIds: flags.production ? 'hashed' : 'named',
    namedChunks: !flags.production,
    namedModules: !flags.production,
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
    flags.dev && new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      template: './src/index.html'
    }),
    ...flags.implementationTemplates.map(page => {
      return new HtmlWebpackPlugin({
        inject: false,
        filename: `${page}.html`,
        template: `./src/templates/${page}.html`
      })
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    ...Object.keys(allEntryPoints).map(key => {
      // wrap each entry's associated CSS file with .cleanslate.prism, excluding :root rules
      // excluding cleanslate CSS
      if (key !== flags.cleanslateEntryPointName) {
        return new PostCssWrapper(`css/${key}.css`, '.cleanslate.prism', /^:root/)
      }
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/images',
        to: 'prism/images'
      }
    ]),
    new webpack.DefinePlugin({
      'ENV': JSON.stringify(ENV),
      'API_PATH': JSON.stringify(API_PATH),
      'APP_NAME': JSON.stringify(APP_NAME),
      'APP_VERSION': JSON.stringify(APP_VERSION),
      'BASE_PATH': JSON.stringify(BASE_PATH),
      'ML_API_URL': JSON.stringify(ML_API_URL)
    }),
    !flags.production && new HardSourceWebpackPlugin({
      configHash: flags.mode,
      cacheDirectory: path.join(flags.rootPath, '.cache/hard-source/[confighash]'),
      info: {
        mode: 'test',
        level: 'debug'
      },
      environmentHash: {
        root: flags.rootPath,
        directories: [],
        files: ['package-lock.json', 'yarn.lock']
      }
    }),
    !flags.production && new HardSourceWebpackPlugin.ExcludeModulePlugin([
      {
        // HardSource works with mini-css-extract-plugin but due to how
        // mini-css emits assets, assets are not emitted on repeated builds with
        // mini-css and hard-source together. Ignoring the mini-css loader
        // modules, but not the other css loader modules, excludes the modules
        // that mini-css needs rebuilt to output assets every time.
        test: /mini-css-extract-plugin[\\/]dist[\\/]loader/
      },
      {
        test: /file-loader/
      },
      {
        test: /css-loader/
      }
    ])
  ].filter(p => p),
  devServer: {
    host: (() => {
      if (BASE_PATH) {
        const matches = BASE_PATH.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)
        if (matches && matches[4]) {
          return matches[4].split(':')[0]
        }
      }

      return 'localhost'
    })(),
    https: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/embeddable/, to: '/embeddable.html' }
      ]
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    disableHostCheck: true
  }
}
