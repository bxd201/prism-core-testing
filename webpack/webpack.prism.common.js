const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')
const isEmpty = require('lodash/isEmpty')
const omit = require('lodash/omit')
const pick = require('lodash/pick')
const WebpackBar = require('webpackbar')
const WebpackManifestPlugin = require('webpack-manifest-plugin')
const flags = require('./constants')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const ALL_VARS = require('../src/shared/variableDefs')
const hash = require('object-hash')
const alias = require('./partial.resolve.alias')
const stats = require('./partial.stats')
const optimization = require('./partial.optimization')
const moduleRuleJsx = require('./partial.module.rules.jsx')
const moduleRuleSass = require('./partial.module.rules.sass')
const envVars = require('./constants.env-vars')

const DEFAULT_ENTRY = `${flags.embedEntryPointName},${flags.mainEntryPointName}` // will build the bundle entry points by default

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env[envVars.npm_package_version]
const APP_NAME = process.env[envVars.npm_package_name]

const ENV = process.env[envVars.NODE_ENV] ? process.env[envVars.NODE_ENV] : 'development'
const API_PATH = (process.env[envVars.API_URL]) ? process.env[envVars.API_URL] : '$API_URL'
const ML_API_URL = (process.env[envVars.ML_API_URL]) ? process.env[envVars.ML_API_URL] : '$ML_API_URL'
const BASE_PATH = (ENV === 'development') ? process.env[envVars.PRISM_LOCAL_ORIGIN] : (process.env[envVars.WEB_URL]) ? process.env[envVars.WEB_URL] : '$WEB_URL'
const SPECIFIED_ENTRIES = process.env[envVars.ENTRY] ? process.env[envVars.ENTRY] : (ENV === 'development') ? DEFAULT_ENTRY : undefined
// This flag if positive will use Firebase anonymous login instead of MySherwin. If value is sticky, clear all cached build files.
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env[envVars.FIREBASE_AUTH_ENABLED])
const SMARTMASK_ENABLED = !!parseInt(process.env[envVars.SMARTMASK_ENABLED])

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

const CACHE_HASH = hash([
  ...flags.mode,
  ...Object.keys(envVars).map(key => process.env[envVars[key]] || '')
])

const DEFINED_VARS = {
  'API_PATH': API_PATH,
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': BASE_PATH,
  'ENV': ENV,
  'ML_API_URL': ML_API_URL,
  'FIREBASE_AUTH_ENABLED': FIREBASE_AUTH_ENABLED,
  'SMARTMASK_ENABLED': SMARTMASK_ENABLED,
  'WEBPACK_CONSTANTS': flags,
  'VAR_NAMES': ALL_VARS.varNames,
  'VAR_VALUES': ALL_VARS.varValues
}

module.exports = {
  name: 'prismMain',
  stats: stats,
  target: 'web',
  watch: false,
  cache: !flags.production,
  devtool: false,
  context: flags.rootPath,
  mode: flags.mode,
  entry: allEntryPoints,
  output: {
    path: flags.distPath,
    filename: flags.production ? `${flags.dirNameDistJs}/[name].[contenthash].js` : `${flags.dirNameDistJs}/[name].js`,
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
      moduleRuleSass,
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
              name: flags.production ? '[name].[contenthash].[ext]' : '[name].[ext]',
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
        test: /(\/fonts\/)|(\.(woff|woff2|eot|ttf|otf)$)/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts',
            publicPath: '/fonts/'
          }
        }]
      },
      {
        test: /\.worker\.js$/,
        exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser))/,
        include: flags.srcPath,
        use: [
          {
            loader: 'worker-loader',
            options: {
              filename: flags.production ? `${flags.dirNameDistJs}/[name].[contenthash].js` : `${flags.dirNameDistJs}/[name].js`,
              chunkFilename: flags.production ? `${flags.dirNameDistJs}/[id].[contenthash].worker.js` : `${flags.dirNameDistJs}/[id].worker.js`
            }
          },
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '../.babelrc')
            }
          }
        ]
      },
      moduleRuleJsx,
      {
        test: /\.ejs$/,
        use: [
          'html-loader',
          {
            loader: 'ejs-html-loader',
            options: DEFINED_VARS
          }
        ]
      }
    ]
  },
  optimization: {
    ...optimization,
    runtimeChunk: {
      name: flags.runtimeNamePrism
    },
    splitChunks: {
      minSize: 0,
      maxInitialRequests: Infinity,
      cacheGroups: [
        {
          name: 'nonR',
          test: /[\\/]node_modules[\\/](?!(react|react-dom|@firebase|@tensorflow|jimp))/
        },
        {
          name: 'ai',
          test: /[\\/]node_modules[\\/](@tensorflow)/
        },
        {
          name: 'imgMan',
          test: /[\\/]node_modules[\\/](jimp)/
        },
        {
          name: 'fb',
          test: /[\\/]node_modules[\\/](@firebase)/
        },
        {
          name: 'r',
          test: /[\\/]node_modules[\\/](react|react-dom)/
        }
      ].map(v => ({
        ...v,
        filename: flags.production ? `${flags.dirNameDistJs}/[name].[contenthash].js` : `${flags.dirNameDistJs}/[name].js`,
        chunks: 'all'
      })).reduce((accum, next) => ({
        ...accum,
        [next.name]: next
      }), {})
    }
  },
  plugins: [
    new WebpackManifestPlugin({
      fileName: '../embed-working/' + flags.manifestNamePrism,
      writeToFileEmit: true,
      generate: (seed, files, entrypoints) => {
        // exclude author.js and export.js (index) from this; everything else should  be good to consume in the manifest
        return Object.keys(omit(entrypoints, [flags.authorEntryPointName, flags.exportEntryPointName])).map(depName => ({
          name: depName,
          // exclude any sourcemap (.map) files
          dependencies: entrypoints[depName].filter(filename => !filename.match(/\.map$/))
        }))
      }
    }),
    new WebpackBar(),
    new MiniCssExtractPlugin({
      filename: flags.production ? `${flags.dirNameDistCss}/[name].[contenthash].css` : `${flags.dirNameDistCss}/[name].css`
    }),
    // NOTE: This is ONLY for copying over scene SVG masks, which webpack otherwise has no way of knowing about
    new CopyWebpackPlugin([
      {
        from: 'src/images-to-copy',
        to: 'prism/images'
      },
      {
        from: 'src/fonts-to-copy',
        to: 'prism/fonts'
      },
      {
        from: 'src/shared/model',
        to: 'src/shared/model'
      }
    ]),
    new webpack.DefinePlugin(Object.entries(DEFINED_VARS).reduce((last, next) => ({ ...last, [next[0]]: JSON.stringify(next[1]) }), {})),
    !flags.production && new HardSourceWebpackPlugin({
      configHash: CACHE_HASH,
      cacheDirectory: path.join(flags.rootPath, '.cache/hard-source/[confighash]'),
      info: {
        mode: 'test',
        level: 'debug'
      },
      environmentHash: {
        root: flags.rootPath,
        directories: ['build-scripts', 'webpack'],
        files: [
          '.browserslistrc',
          '.eslintignore',
          '.eslintrc',
          '.babelrc',
          'package-lock.json',
          'package.json',
          'postcss.config.js'
        ]
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
  ].filter(p => p)
}
