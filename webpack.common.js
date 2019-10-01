const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const PostCssWrapper = require('postcss-wrapper-loader')
const { sassRules } = require('./webpack/sassRules')
const webpack = require('webpack')
const WebpackBar = require('webpackbar');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const flags = require('./webpack/constants')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const API_PATH = (process.env.API_URL) ? process.env.API_URL : '$API_URL'
const ML_API_URL = (process.env.ML_API_URL) ? process.env.ML_API_URL : '$ML_API_URL'
const BASE_PATH = (process.env.WEB_URL) ? process.env.WEB_URL : '$WEB_URL'

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
    bundle: flags.appIndexPath
  },
  output: {
    path: flags.distPath,
    filename: '[name].js',
    globalObject: 'self'
  },
  resolve: {
    symlinks: false,

    alias: {
      constants: path.resolve(__dirname, 'src/constants/'),
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
    new HtmlWebpackPlugin({
      inject: false,
      filename: 'embeddable.html',
      template: './src/templates/embeddable.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new PostCssWrapper('bundle.css', '.cleanslate.prism'),
    new CopyWebpackPlugin([
      {
        from: 'src/images',
        to: 'prism/images'
      },
      {
        from: 'src/css/*',
        to: 'css',
        flatten: true
      }
    ]),
    new webpack.DefinePlugin({
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
    host: '0.0.0.0', // allows for hitting this from ouside the host machine
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/embeddable/, to: '/embeddable.html' }
      ]
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true
  }
}
