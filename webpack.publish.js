const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const { sassRules } = require('./webpack/sassRules')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const flags = require('./webpack/constants')
const ALL_VARS = require('./src/shared/variableDefs')

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const API_PATH = (process.env.API_URL) ? process.env.API_URL : '$API_URL'
const ML_API_URL = (process.env.ML_API_URL) ? process.env.ML_API_URL : '$ML_API_URL'
const BASE_PATH = (process.env.WEB_URL) ? process.env.WEB_URL : '$WEB_URL'
// This flag if positive will use Firebase anonymous login instead of MySherwin
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env.FIREBASE_AUTH_ENABLED)
const ENV = process.env.NODE_ENV

const DEFINED_VARS = {
  'API_PATH': API_PATH,
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': BASE_PATH,
  'ENV': ENV,
  'FIREBASE_AUTH_ENABLED': FIREBASE_AUTH_ENABLED,
  'ML_API_URL': ML_API_URL,
  'WEBPACK_CONSTANTS': flags,
  'VAR_NAMES': ALL_VARS.varNames,
  'VAR_VALUES': ALL_VARS.varValues
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
      variables: path.resolve(__dirname, 'src/shared/variablesExport.js')
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
        exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser|hashids))/,
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
        exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser|hashids))/,
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
