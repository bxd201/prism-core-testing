const tinycolor = require('@ctrl/tinycolor').default
const mostReadable = require('@ctrl/tinycolor').mostReadable
const kebabCase = require('lodash/kebabCase')
const flattenDeep = require('lodash/flattenDeep')

const themeColorPrefix = '--prism-theme-color-'

const defaultThemeColors = {
  active: '#369', // focused UI element color
  black: '#000', // #000
  danger: '#E94b35', // error/problem color (usually red)
  info: '#209cee', // informational area color (usually blue)
  link: '#3273dc', // hyperlink color (maps over from primary if not set in config)
  light: '#dddddd', // nearly white
  dark: '#2e2e2e', // nearly black
  primary: '#0069af', // main button/UI color
  secondary: '#2cabe2', // secondary button/UI color
  success: '#1fce6d', // success color (usually green)
  warning: '#f2c500', // warning color (usually orange or yellow)
  white: '#FFF' // #FFF
}

const themeColors = Object.keys(defaultThemeColors)

const getOneThemeColorObj = (name = '', color = undefined, injectTransparent = false, injectContrast = false) => {
  const modName = `--${kebabCase(name)}`
  const obj = { prop: modName }

  if (color) {
    obj.color = color
  }

  if (injectContrast) {
    obj.contrast = getOneThemeColorObj(`${modName}-contrast`, color ? mostReadable(color, ['#000', '#FFF']).toHexString() : undefined, true, false)
  }

  if (injectTransparent) {
    obj.trans = getOneThemeColorObj(`${modName}-trans`, color ? tinycolor(color).setAlpha(0.9).toRgbString() : undefined, false, false)
  }

  return obj
}

const getThemeColorsObj = (colorNames, colorValuesObj = {}) => {
  if (colorNames) {
    return colorNames.map((colorName) => {
      const color = colorValuesObj[colorName]
      const maybeTc = color ? tinycolor(color) : undefined
      const modName = `${themeColorPrefix}${kebabCase(colorName)}`

      return [colorName, {
        ...getOneThemeColorObj(modName, color || undefined, true, true),
        darker: getOneThemeColorObj(`${modName}-darker`, maybeTc ? maybeTc.shade(15).toHexString() : undefined, true, true),
        darkest: getOneThemeColorObj(`${modName}-darkest`, maybeTc ? maybeTc.shade(85).toHexString() : undefined, true, true),
        lighter: getOneThemeColorObj(`${modName}-lighter`, maybeTc ? maybeTc.tint(15).toHexString() : undefined, true, true),
        lightest: getOneThemeColorObj(`${modName}-lightest`, maybeTc ? maybeTc.tint(85).toHexString() : undefined, true, true)
      }]
    }).reduce((accum, [colorName, colorObj]) => ({
      ...accum,
      [colorName]: colorObj
    }), {})
  }

  return {}
}

const extractThemeData = (obj) => {
  return Object.keys(obj).map(name => {
    const data = obj[name]

    let returner = []

    if (typeof data === 'object') {
      // $FlowIgnore
      returner.push(extractThemeData(data))
    }

    if (data.prop && data.color) {
      returner.push({ prop: data.prop, color: data.color })
    }

    return returner
  })
}

const mapVarsToColors = baseColors => flattenDeep(extractThemeData(baseColors)).reduce((accum, { prop, color }) => ({
  ...accum,
  [prop]: color
}), {})

module.exports = {
  defaultThemeColors,
  getThemeColorsObj,
  mapVarsToColors,
  themeColorPrefix,
  themeColors
}
