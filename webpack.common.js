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
const ALL_VARS = require('./src/shared/variableDefs')
const requireContext = require('require-context')
const hash = require('object-hash')

const DEFAULT_LOCAL_URL = 'https://localhost:8080' // default local URL to localhost
const DEFAULT_ENTRY = `${flags.embedEntryPointName},${flags.mainEntryPointName},${flags.templateIndexEntryPointName}` // will build the embed and bundle entry points by default

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
// This flag if positive will use Firebase anonymous login instead of MySherwin. If value is sticky, clear all cached build files.
const FIREBASE_AUTH_ENABLED = !!parseInt(process.env.FIREBASE_AUTH_ENABLED)

// TODO: Use this same concept to eliminate the redundancy of facetEntryPoints in constants, export.js, and allFacets.js -@cody.richmond
const TEMPLATES_SRC_LOCATION = 'src/templates/'
const TEMPLATES_DIST_LOCATION = 'templates/'
const allTemplates = (ctx => {
  return ctx.keys().map(template => ({
    input: `${TEMPLATES_SRC_LOCATION}${template}`,
    output: `${TEMPLATES_DIST_LOCATION}${template.replace(/(.*)\.ejs/, '$1.html')}`
  }))
})(requireContext(path.resolve(__dirname, TEMPLATES_SRC_LOCATION), true, /.*/))

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

// NOTE re: CACHE_HASH
// HardsourceCache sometimes does a pretty lousy job of invalidating itself when things that AREN'T imported change
// In particular it seems to have issues with our template files since they're just unrelated HTML files in a directory
// To get around this, we're generating a CACHE_HASH value based on the hash of our current mode (which maps to the
// node environment value) as well as an array of all our existing templates.
// Creating a new template, changing the name of an existing template or directory, and altering directory structure will
// continue to require a restart, but at least those changes WILL be included in the cache.
const CACHE_HASH = hash([
  ...flags.mode,
  ...allTemplates.map(template => template.input)
])

const DEFINED_VARS = {
  'API_PATH': API_PATH,
  'APP_NAME': APP_NAME,
  'APP_VERSION': APP_VERSION,
  'BASE_PATH': BASE_PATH,
  'ENV': ENV,
  'ML_API_URL': ML_API_URL,
  'FIREBASE_AUTH_ENABLED': FIREBASE_AUTH_ENABLED,
  'WEBPACK_CONSTANTS': flags,
  'VAR_NAMES': ALL_VARS.varNames,
  'VAR_VALUES': ALL_VARS.varValues,
  'STATIC_TEMPLATES': allTemplates.map(template => template.output)
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
          'worker-loader',
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '.babelrc')
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser))/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(__dirname, '.babelrc')
            }
          },
          'eslint-loader'
        ],
        resolve: { extensions: [ '.js', '.jsx' ] }
      },
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
    occurrenceOrder: false, // <-- KEEP THIS OFF. it can cause a race condition that fails app initialization.
    portableRecords: false,
    providedExports: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
    sideEffects: flags.production,
    splitChunks: {
      minSize: 0,
      maxInitialRequests: Infinity,
      cacheGroups: {
        [flags.chunkNonReactName]: {
          filename: '[name].js',
          name: flags.chunkNonReactName,
          test: /[\\/]node_modules[\\/](?!(react|react-dom|@firebase|@tensorflow|jimp))/,
          chunks (chunk) {
            const dontChunk = chunk.name === flags.templateIndexEntryPointName || chunk.name === flags.embedEntryPointName
            return !dontChunk
          }
        },
        [flags.chunkAIName]: {
          filename: '[name].js',
          name: flags.chunkAIName,
          test: /[\\/]node_modules[\\/](@tensorflow)/,
          chunks (chunk) {
            const dontChunk = chunk.name === flags.templateIndexEntryPointName || chunk.name === flags.embedEntryPointName
            return !dontChunk
          }
        },
        [flags.chunkImageManipulationName]: {
          filename: '[name].js',
          name: flags.chunkImageManipulationName,
          test: /[\\/]node_modules[\\/](jimp)/,
          chunks (chunk) {
            const dontChunk = chunk.name === flags.templateIndexEntryPointName || chunk.name === flags.embedEntryPointName
            return !dontChunk
          }
        },
        [flags.chunkFirebaseName]: {
          filename: '[name].js',
          name: flags.chunkFirebaseName,
          test: /[\\/]node_modules[\\/](@firebase)/,
          chunks (chunk) {
            const dontChunk = chunk.name === flags.templateIndexEntryPointName || chunk.name === flags.embedEntryPointName
            return !dontChunk
          }
        },
        [flags.chunkReactName]: {
          filename: '[name].js',
          name: flags.chunkReactName,
          test: /[\\/]node_modules[\\/](react|react-dom)/,
          chunks (chunk) {
            const dontChunk = chunk.name === flags.templateIndexEntryPointName || chunk.name === flags.embedEntryPointName
            return !dontChunk
          }
        }
      }
    },
    usedExports: flags.production
  },
  plugins: [
    new WebpackBar(),
    flags.dev && new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      template: './src/index/index.ejs',
      filename: path.resolve(flags.distPath, 'index.html')
    }),
    ...allTemplates.map(template => {
      return new HtmlWebpackPlugin({
        inject: false,
        filename: `${template.output}`,
        template: `${template.input}`
      })
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    ...[
      ...Object.keys(allEntryPoints),
      flags.chunkAIName,
      flags.chunkFirebaseName,
      flags.chunkImageManipulationName,
      flags.chunkNonReactName,
      flags.chunkReactName
    ].map(key => {
      // wrap each entry's associated CSS file with .clnslt.prism, excluding :root rules
      // excluding anything from our "fixed" entrypoints, which are cleanslate and template index
      if (!flags.fixedEntryPoints[key]) {
        return new PostCssWrapper(`css/${key}.css`, `.${flags.prismWrappingClass}.${flags.cleanslateWrappingClass}`, /^:root/)
      }
    }).filter(v => !!v),
    // NOTE: This is ONLY for copying over scene SVG masks, which webpack otherwise has no way of knowing about
    new CopyWebpackPlugin([
      {
        from: 'src/images-to-copy',
        to: 'prism/images'
      },
      {
        from: 'src/fonts-to-copy',
        to: 'prism/fonts'
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
          'postcss.config.js',
          'webpack.common.js',
          'webpack.dev.js',
          'webpack.prod.js',
          'webpack.publish.js'
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
        { from: /^\/$/, to: '/index/' },
        { from: /^\/index\/embeddable/, to: '/index/embeddable.html' }
      ]
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    writeToDisk: true,
    disableHostCheck: true
  }
}
