const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const webpack = require('webpack')
const isEmpty = require('lodash/isEmpty')
const omit = require('lodash/omit')
const WebpackBar = require('webpackbar')
const WebpackManifestPlugin = require('webpack-manifest-plugin')
const flags = require('./constants')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const ALL_VARS = require('../src/shared/withBuild/variableDefs')
const hash = require('object-hash')
const alias = require('./partial.resolve.alias')
const stats = require('./partial.stats')
const optimization = require('./partial.optimization')
const moduleRuleJsx = require('./partial.module.rules.jsx')
const { sassModuleRules, sassRules } = require('./partial.module.rules.sass')
const envVars = require('./constants.env-vars')
const NameAllModulesPlugin = require('name-all-modules-plugin')
const AsyncChunkNames = require('webpack-async-chunk-names-plugin')
const { contractString } = require('./utils')

// create constants that correlate to environment variables to be injected
const APP_VERSION = process.env.npm_package_version
const APP_NAME = process.env.npm_package_name

const ENV = process.env[envVars.NODE_ENV] ? process.env[envVars.NODE_ENV] : 'development'
const GENERATE_FACET_ASSETS = (!!process.env[envVars.GENERATE_FACET_ASSETS] || ENV === 'production')
const API_PATH = process.env[envVars.API_URL]
const ML_API_URL = process.env[envVars.ML_API_URL]
const BASE_PATH = (ENV === 'development') ? process.env[envVars.PRISM_LOCAL_ORIGIN] : (process.env[envVars.WEB_URL]) ? process.env[envVars.WEB_URL] : '$WEB_URL'
// This flag if positive will use Firebase anonymous login instead of MySherwin. If value is sticky, clear all cached build files.
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env[envVars.FIREBASE_AUTH_ENABLED])
const S3_PATH = (process.env[envVars.S3_PATH]) ? process.env[envVars.S3_PATH] : '$S3_PATH'
const SMARTMASK_ENABLED = !!parseInt(process.env[envVars.SMARTMASK_ENABLED])

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

const CACHE_HASH = hash([
  ...flags.mode,
  ...Object.keys(envVars).map(key => process.env[envVars[key]] || ''),
  Object.keys(flags.facetEntryPoints).join(',')
])

const DEFINED_VARS = {
  'API_PATH': API_PATH,
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': BASE_PATH,
  'ENV': ENV,
  'FIREBASE_AUTH_ENABLED': FIREBASE_AUTH_ENABLED,
  'GENERATE_FACET_ASSETS': GENERATE_FACET_ASSETS,
  'IS_DEVELOPMENT': ENV === 'development',
  'IS_PRODUCTION': ENV !== 'development',
  'ML_API_URL': ML_API_URL,
  'S3_PATH': S3_PATH,
  'SMARTMASK_ENABLED': SMARTMASK_ENABLED,
  'VAR_NAMES': ALL_VARS.varNames,
  'VAR_VALUES': ALL_VARS.varValues,
  'WEBPACK_CONSTANTS': flags
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
    filename: flags.production ? `${flags.dirNameDistJs}/[name].[contenthash:4].js` : `${flags.dirNameDistJs}/[name].js`,
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
              name: flags.production ? '[name].[contenthash:4].[ext]' : '[name].[ext]',
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
            publicPath: `${BASE_PATH}/fonts/`
          }
        }]
      },
      {
        test: /\.worker\.js$/,
        exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser|@firebase|@fortawesome\/react-fontawesome))/,
        include: flags.srcPath,
        use: [
          {
            loader: 'worker-loader',
            options: {
              inline: true,
              fallback: false
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
      ...(GENERATE_FACET_ASSETS ? {
        chunks: 'initial',
        name: (module, chunks, cacheGroupKey) => {
          const moduleFileName = module.identifier().split('/').reduceRight(item => contractString(item.replace(/\.js$/g, '')))
          const allChunksNames = chunks.map((item) => contractString(item.name)).join('')
          return `_${contractString(cacheGroupKey)}_${allChunksNames}_${moduleFileName}`
        },
        minSize: 100000,
        maxSize: 1250000,
        maxInitialRequests: Infinity,
        cacheGroups: {
          workers: {
            filename: `${flags.dirNameDistJs}/[name].[contenthash:4].js`,
            test: /\.worker\.js$/,
            name: (module, chunks, cacheGroupKey) => {
              const moduleFileName = module.identifier().split('/').reduceRight(item => contractString(item.replace(/\.js$/g, '')))
              return `_${contractString(cacheGroupKey)}_${moduleFileName}`
            }
          },
          cleanslate: {
            filename: `${flags.dirNameDistJs}/[name].[contenthash:4].js`,
            test: /cleanslate/,
            name: 'cleanslate',
            reuseExistingChunk: true,
            enforce: true
          },
          vendors: {
            filename: `${flags.dirNameDistJs}/[name].[contenthash:4].js`,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            filename: `${flags.dirNameDistJs}/[name].[contenthash:4].js`,
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          async: {
            chunks: 'async',
            name: false,
            enforce: true,
            priority: 1,
            minSize: 100000,
            maxSize: 1250000,
            reuseExistingChunk: true
          }
        }
      } : {
        chunks: 'initial',
        cacheGroups: {
          workers: {
            filename: `${flags.dirNameDistJs}/[name].js`,
            test: /\.worker\.js$/,
            name: (module, chunks, cacheGroupKey) => {
              const moduleFileName = module.identifier().split('/').reduceRight(item => contractString(item.replace(/\.js$/g, '')))
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
          tailwind: {
            filename: `${flags.dirNameDistJs}/[name].js`,
            test: /tailwindcss/,
            name: 'tailwind',
            reuseExistingChunk: true,
            enforce: true
          },
          vendors: {
            filename: `${flags.dirNameDistJs}/[name].js`,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          }
        }
      })
    }
  },
  plugins: [
    ...(GENERATE_FACET_ASSETS ? [
      new webpack.HashedModuleIdsPlugin(),
      new webpack.NamedChunksPlugin((chunk) => {
        if (chunk.name) {
          return chunk.name
        }
        try {
          return chunk.modules.map(m => path.relative(m.context, m.request)).join('_')
        } catch (err) {
          console.warn('Warning! Unnamed chunk discovdered here:', chunk)
          return 'nameless'
        }
      }),
      new webpack.NamedModulesPlugin(),
      new NameAllModulesPlugin(),
      new AsyncChunkNames()
    ] : []),
    new WebpackManifestPlugin({
      fileName: '../embed-working/' + flags.manifestNamePrism,
      writeToFileEmit: true,
      generate: (seed, files, entrypoints) => {
        // exclude author.js and export.js (index) from this; everything else should  be good to consume in the manifest
        return Object.keys(omit(entrypoints, [flags.authorEntryPointName, flags.exportEntryPointName])).map(depName => ({
          name: depName,
          main: depName === flags.mainEntryPointName, // flags the main bundle in case we need to identify it
          // exclude any sourcemap (.map) files
          dependencies: entrypoints[depName].filter(filename => !filename.match(/\.map$/))
        }))
      }
    }),
    new WebpackBar(),
    new MiniCssExtractPlugin({
      filename: flags.production ? `${flags.dirNameDistCss}/[name].[contenthash:4].css` : `${flags.dirNameDistCss}/[name].css`
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
        mode: 'none',
        level: 'warn'
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
