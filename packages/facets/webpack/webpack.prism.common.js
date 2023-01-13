const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const isEmpty = require('lodash/isEmpty')
const sortBy = require('lodash/sortBy')
const omit = require('lodash/omit')
const WebpackBar = require('webpackbar')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const flags = require('./constants')
const ALL_VARS = require('../src/shared/withBuild/variableDefs')
const alias = require('./partial.resolve.alias')
const optimization = require('./partial.optimization')
const moduleRuleJsx = require('./partial.module.rules.tsx.js')
const moduleRuleTsx = require('./partial.module.rules.tsx')
const { cssModuleRules, cssRules, sassModuleRules, sassRules } = require('./partial.module.rules.sass')
const envVars = require('./constants.env-vars')
const { contractString } = require('./utils')
require('dotenv').config()

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const ENV = process.env[envVars.NODE_ENV] ? process.env[envVars.NODE_ENV] : 'development'
const GENERATE_FACET_ASSETS = !!process.env[envVars.GENERATE_FACET_ASSETS] || ENV === 'production'
const API_PATH = process.env[envVars.API_URL]
const ML_API_URL = process.env[envVars.ML_API_URL]
const BASE_PATH =
  ENV === 'development'
    ? process.env[envVars.PRISM_LOCAL_ORIGIN]
    : process.env[envVars.WEB_URL]
    ? process.env[envVars.WEB_URL]
    : '$WEB_URL'
// This flag if positive will use Firebase anonymous login instead of MySherwin. If value is sticky, clear all cached build files.
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env[envVars.FIREBASE_AUTH_ENABLED])
const S3_PATH = process.env[envVars.S3_PATH] ? process.env[envVars.S3_PATH] : '$S3_PATH'
const SMARTMASK_ENABLED = !!parseInt(process.env[envVars.SMARTMASK_ENABLED])
const MOCK_API = !!process.env[envVars.MOCK_API]

let allEntryPoints = {
  ...(GENERATE_FACET_ASSETS ? flags.facetEntryPoints : flags.mainEntryPoints)
}

// if we do not have any valid entry points...
if (isEmpty(allEntryPoints)) {
  // ... error out of the build
  throw new Error('No valid entry points specified.')
} else {
  console.info('You are attempting to build the following entry points:', Object.keys(allEntryPoints))
}

const DEFINED_VARS = {
  API_PATH: API_PATH,
  APP_NAME: APP_NAME,
  APP_VERSION: APP_VERSION,
  BASE_PATH: BASE_PATH,
  ENV: ENV,
  FIREBASE_AUTH_ENABLED: FIREBASE_AUTH_ENABLED,
  GENERATE_FACET_ASSETS: GENERATE_FACET_ASSETS,
  IS_DEVELOPMENT: ENV === 'development',
  IS_PRODUCTION: ENV !== 'development',
  ML_API_URL: ML_API_URL,
  S3_PATH: S3_PATH,
  SMARTMASK_ENABLED: SMARTMASK_ENABLED,
  VAR_NAMES: ALL_VARS.varNames,
  VAR_VALUES: ALL_VARS.varValues,
  WEBPACK_CONSTANTS: flags,
  MOCK_API: MOCK_API
}

module.exports = {
  name: 'prismMain',
  target: 'web',
  watch: false,
  cache: !flags.production,
  devtool: false,
  context: flags.rootPath,
  mode: flags.mode,
  entry: allEntryPoints,
  output: {
    path: flags.distPath,
    filename: flags.production
      ? `${flags.dirNameDistJs}/[name].[contenthash:8].js`
      : `${flags.dirNameDistJs}/[name].js`,
    globalObject: 'self',
    publicPath: `${BASE_PATH}/`
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
      cssModuleRules,
      cssRules,
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
              name: flags.production ? '[name].[contenthash:8].[ext]' : '[name].[ext]',
              outputPath: 'images',
              publicPath: `${BASE_PATH}/images/`
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
                quality: [0.65, 0.9],
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
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts',
              publicPath: `${BASE_PATH}/fonts/`
            }
          }
        ]
      },
      {
        test: /\.worker\.js$/,
        exclude:
          /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser|@firebase|@fortawesome\/react-fontawesome))/,
        include: flags.srcPath,
        use: [
          {
            loader: 'worker-loader',
            options: {
              inline: 'no-fallback'
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
      moduleRuleJsx
    ]
  },
  optimization: {
    ...optimization,
    runtimeChunk: {
      name: flags.runtimeNamePrism
    },
    splitChunks: {
      ...(GENERATE_FACET_ASSETS
        ? {
            chunks: 'initial',
            name: (module, chunks, cacheGroupKey) => {
              const moduleFileName = module
                .identifier()
                .split('/')
                .reduceRight((item) => contractString(item.replace(/\.js$/g, '')))
              const allChunksNames = chunks.map((item) => contractString(item.name)).join('')
              return `_${contractString(cacheGroupKey)}_${allChunksNames}_${moduleFileName}`
            },
            minSize: 100000,
            maxSize: 1250000,
            maxInitialRequests: Infinity,
            cacheGroups: {
              toolkit: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /@prism\/toolkit/,
                name: 'toolkit',
                reuseExistingChunk: true,
                priority: 1,
                enforce: true,
                minSize: 1000,
                maxSize: 1250000
              },
              tailwind: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /tailwindcss/,
                name: 'tailwind',
                reuseExistingChunk: true,
                priority: -1,
                enforce: true
              },
              workers: {
                filename: `${flags.dirNameDistJs}/[name].[contenthash:8].js`,
                test: /\.worker\.js$/,
                name: (module, chunks, cacheGroupKey) => {
                  const moduleFileName = module
                    .identifier()
                    .split('/')
                    .reduceRight((item) => contractString(item.replace(/\.js$/g, '')))
                  return `_${contractString(cacheGroupKey)}_${moduleFileName}`
                }
              },
              cleanslate: {
                filename: `${flags.dirNameDistJs}/[name].[contenthash:8].js`,
                test: /cleanslate/,
                name: 'cleanslate',
                reuseExistingChunk: true,
                enforce: true
              },
              vendors: {
                filename: `${flags.dirNameDistJs}/[name].[contenthash:8].js`,
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true
              },
              default: {
                filename: `${flags.dirNameDistJs}/[name].[contenthash:8].js`,
                minChunks: 1,
                priority: -20,
                reuseExistingChunk: true
              },
              async: {
                chunks: 'async',
                name: (module, chunks, cacheGroupKey) => {
                  const moduleFileName = module
                    .identifier()
                    .split('/')
                    .reduceRight((item) => contractString(item.replace(/\.js$/g, '')))
                  const allChunksNames = chunks.map((item) => contractString(item.name)).join('')
                  return `_async_${contractString(cacheGroupKey)}_${allChunksNames}_${moduleFileName}`
                },
                enforce: true,
                priority: 1,
                minSize: 100000,
                maxSize: 1250000,
                reuseExistingChunk: true
              },
              styles: {
                chunks: 'all',
                type: 'css/mini-extract',
                enforce: true,
                minSize: 5000,
                maxSize: 100000,
                reuseExistingChunk: false
              }
            }
          }
        : {
            chunks: 'initial',
            minSize: 100000,
            maxSize: 1250000,
            maxInitialRequests: Infinity,
            cacheGroups: {
              toolkit: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /@prism\/toolkit/,
                name: 'toolkit',
                reuseExistingChunk: true,
                priority: 1,
                enforce: true
              },
              tailwind: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /tailwindcss/,
                name: 'tailwind',
                reuseExistingChunk: true,
                priority: -1,
                enforce: true
              },
              workers: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /\.worker\.js$/,
                name: (module, chunks, cacheGroupKey) => {
                  const moduleFileName = module
                    .identifier()
                    .split('/')
                    .reduceRight((item) => contractString(item.replace(/\.js$/g, '')))
                  return `_${contractString(cacheGroupKey)}_${moduleFileName}`
                }
              },
              cleanslate: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /cleanslate/,
                name: 'cleanslate',
                reuseExistingChunk: true,
                enforce: true
              },
              vendors: {
                filename: `${flags.dirNameDistJs}/[name].js`,
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true
              },
              styles: {
                chunks: 'all',
                type: 'css/mini-extract',
                name: false,
                enforce: true,
                minSize: 5000,
                maxSize: 100000,
                reuseExistingChunk: false
              }
            }
          })
    }
  },
  plugins: [
    ...(GENERATE_FACET_ASSETS ? [] : []),
    new WebpackManifestPlugin({
      fileName: '../embed-working/' + flags.manifestNamePrism,
      writeToFileEmit: true,
      generate: (seed, files, entrypoints) => {
        // this is used to determine priority when sorting manifest based on appearance of keywords
        // higher priority to lower index in sortOrder[]
        const sortOrder = ['runtime', 'cleanslate', 'tailwind', 'toolkit']

        // gather all initial (meaning: not async) chunk files
        const allInitialFiles = Object.keys(entrypoints)
          .map((key) => entrypoints[key])
          .reduce((accum, next) => {
            return [...accum, ...next]
          }, [])

        // determine all async styles by finding non-initial CSS files which are not included
        // in the list of initial files
        const asyncStyles = files
          .filter((v) => !v.isInitial) // it's async
          .filter((v) => v.path.match(/.css$/))
          .filter((v) => {
            return allInitialFiles.filter((initFile) => v.path.indexOf(initFile) >= 0).length === 0
          })
          .map((v) => v.path.split(`${BASE_PATH}/`).slice(-1)[0])

        const dependenciesToFacetsMap = new Map()
        const allFacetIndexes = []

        // exclude author.js (index) from this; everything else should  be good to consume in the manifest
        const manifest = Object.keys(omit(entrypoints, [flags.authorEntryPointName])).map((depName, i) => {
          entrypoints[depName]
            // exclude sourcemaps
            .filter((filename) => !filename.match(/\.map$/))
            // exclude HMR files (they will throw errors in dev mode if manually consumed)
            .filter((filename) => !filename.match(/\.hot-update\./))
            .forEach((v) => {
              if (dependenciesToFacetsMap.has(v)) {
                dependenciesToFacetsMap.set(v, [...dependenciesToFacetsMap.get(v), i])
              } else {
                dependenciesToFacetsMap.set(v, [i])
              }
            })
          allFacetIndexes.push(i)
          return {
            name: depName,
            main: depName === flags.mainEntryPointName // flags the main bundle in case we need to identify it
          }
        })
        const sortedDependencies = new Map([
          ...sortBy(Array.from(dependenciesToFacetsMap), (v) => {
            // using for... so we can return out
            for (const i in sortOrder) {
              if (v[0].toLowerCase().indexOf(sortOrder[i].toLowerCase()) >= 0) {
                return i // give sort priority equal to matched index in sortOrder[]
              }
            }
            return Infinity // anything that doesn't have a match in sort order will be given a priority of Infinity
          }),
          ...asyncStyles.map((v) => [v, allFacetIndexes]) // include stylesheets associated to ALL facets
        ])
        return {
          facets: manifest,
          dependencies: Object.fromEntries(sortedDependencies)
        }
      }
    }),
    new WebpackBar(),
    new MiniCssExtractPlugin({
      filename: flags.production
        ? ({ chunk }) => {
            return `${flags.dirNameDistCss}/${chunk.name}.[contenthash:8].css`
          }
        : `${flags.dirNameDistCss}/[name].css`,
      chunkFilename: '[id].css'
    }),
    // NOTE: This is ONLY for copying over scene SVG masks, which webpack otherwise has no way of knowing about
    new CopyWebpackPlugin({
      patterns: [
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
      ]
    }),
    new ESLintPlugin(),
    new webpack.DefinePlugin(
      Object.entries(DEFINED_VARS).reduce((last, next) => ({ ...last, [next[0]]: JSON.stringify(next[1]) }), {})
    )
  ].filter((p) => p)
}
