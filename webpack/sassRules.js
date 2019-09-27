const memoizee = require('memoizee')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const sass = require('node-sass')
const sassUtils = require('node-sass-utils')(sass)
const varNames = Object.freeze(require('../src/shared/variables.js').varNames)
const varValues = Object.freeze(require('../src/shared/variables.js').varValues)
const path = require('path')
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
const sassRules = [
  MiniCssExtractPlugin.loader,
  'css-loader',
  'postcss-loader',
  {
    loader: 'sass-loader',
    options: {
      functions: {
        '_getVar($keys)': getVarGenerator(varValues),
        '_getVarName($keys)': getVarGenerator(varNames)
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

module.exports = {
  sassRules
}
