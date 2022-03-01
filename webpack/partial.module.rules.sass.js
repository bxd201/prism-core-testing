const memoizee = require('memoizee')
const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')
const cssCustomPropsFallback = require('./plugins/postCSS/cssCustomPropsFallback')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const PrefixWrap = require('postcss-prefixwrap')
const sass = require('node-sass')
const sassUtils = require('node-sass-utils')(sass)
const { themeColors, getThemeColorsObj, defaultThemeColors, themeColorPrefix, mapVarsToColors } = require('../src/shared/withBuild/themeColors.js')
const ALL_VARS = require('../src/shared/withBuild/variableDefs.js')
const varNames = Object.freeze(ALL_VARS.varNames)
const varValues = Object.freeze(ALL_VARS.varValues)
const path = require('path')
const flags = require('./constants')
const at = require('lodash/at')
const getVarGenerator = (function () {
  const cssUnits = [
    'rem',
    'em',
    'vh',
    'vw',
    'vmin',
    'vmax',
    'ex',
    '%',
    'px',
    'cm',
    'mm',
    'in',
    'pt',
    'pc',
    'ch'
  ]

  // look for anything starting with a whole number or decimal and ending in one of the above units
  const unitRegex = new RegExp(`^([0-9.]+)(${cssUnits.join('|')})$`)
  const numberRegex = new RegExp(`^[0-9.]+$`)

  const convertStringToSassDimension = memoizee(function convertStringToSassDimension (str) {
    // Only attempt to convert strings
    if (typeof str !== 'string') {
      return str
    }

    const pureNumber = numberRegex.exec(str)

    if (pureNumber) {
      return new sassUtils.SassDimension(parseFloat(pureNumber[0], 10))
    }

    const result = unitRegex.exec(str)

    if (result) {
      const value = result[ 1 ]
      const unit = result[ 2 ]

      return new sassUtils.SassDimension(parseFloat(value, 10), unit)
    }

    return str
  }, { primitive: true, length: 1 })

  function processVarData (data) {
    var type = typeof data

    var returner

    // Convert to SassDimension if dimenssion
    if (type === 'number') {
      returner = new sassUtils.SassDimension(parseFloat(data, 10))
    } else if (type === 'string') {
      returner = convertStringToSassDimension(data)
    } else if (type === 'object') {
      // if it's an object, we'll need to recursively iterate through it
      returner = {}
      Object.keys(data).forEach(function (key) {
        returner[ key ] = processVarData(data[ key ])
      })
    }

    return returner
  }

  return function getVarGenerator (values) {
    const getVarInternal_memoized = memoizee(function getVarInternal (keys) {
      var _keys = keys.split('.'); var returner; var i

      returner = Object.assign({}, values)

      for (i = 0; i < _keys.length; i++) {
        returner = returner[ _keys[ i ] ]
      }

      return sassUtils.castToSass(processVarData(returner))
    }, { primitive: true, length: 1 })

    return (keys) => getVarInternal_memoized(keys.getValue())
  }
})()

const themeColorStructure = getThemeColorsObj(themeColors, defaultThemeColors)

const getThemeColorByPath = ((themeColorData) => {
  return (whatever) => {
    const path = whatever.getValue()
    const val = at(themeColorData, path)[0]

    if (val && val.prop) {
      return sassUtils.castToSass(val.prop)
    }

    throw new Error(`Unable to locate ${path} in theme colors data`)
  }
})(themeColorStructure)

const getRules = (cssLoaderOpts = {}) => {
  return [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: cssLoaderOpts
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          tailwindcss(),
          cssCustomPropsFallback([
            {
              varPrefix: themeColorPrefix,
              varFallbackMap: mapVarsToColors(themeColorStructure)
            }
          ]),
          autoprefixer(),
          PrefixWrap(`.${flags.prismWrappingClass}.${flags.cleanslateWrappingClass}`, {
            ignoredSelectors: [/^:root/],
            blacklist: [flags.cleanslateEntryPointName]
          })
        ]
      }
    },
    {
      loader: 'sass-loader',
      options: {
        prependData: [
          '$cleanslateWrappingClass: ' + flags.cleanslateWrappingClass,
          '$env: ' + flags.mode,
          '$prismWrappingClass: ' + flags.prismWrappingClass
        ].join(';') + ';',
        sassOptions: (loaderContext) => {
          return {
            functions: {
              '_getVar($keys)': getVarGenerator(varValues),
              '_getVarName($keys)': getVarGenerator(varNames),
              '_getThemeColor($keys)': getThemeColorByPath
            }
          }
        }
      }
    },
    {
      loader: 'sass-resources-loader',
      options: {
        resources: [
          path.resolve(__dirname, '../src/scss/mixins/mixins.scss'),
          path.resolve(__dirname, '../src/scss/functions/functions.scss'),
          path.resolve(__dirname, '../src/scss/variables.scss')
        ]
      }
    }
  ]
}

const sassRules = {
  test: /\.(sc|sa|c)ss$/,
  use: getRules(),
  exclude: /\.module\.(sc|sa|c)ss$/
}

const sassModuleRules = {
  test: /\.(sc|sa|c)ss$/,
  use: getRules({ importLoaders: 1, modules: true }),
  include: /\.module\.(sc|sa|c)ss$/
}

module.exports = {
  sassModuleRules,
  sassRules
}
