// @flow
import tinycolor from '@ctrl/tinycolor'
import _ from 'lodash'

function ColorUtils () {}

/**
 * @param {*} colorValue String, hex, or tinycolor-compatible rgb(a)/hsl(a)/hsv(a) object
 * @param {number} newLuminosity number between 0 and 100
 * @description Takes a color in any tinycolor-compatible format and adjusts its luminosity to an absolute value between 0 and 100
 */
function alterLuminosity (colorValue: any, newLuminosity: number):TinyColor {
  const tc = tinycolor(colorValue)
  const hsl = tc.toHsl()
  return tinycolor(`hsl(${hsl.h}, ${hsl.s * 100}%, ${newLuminosity}%)`)
}

ColorUtils.alterLuminosity = _.memoize( alterLuminosity, function (colorValue, newLuminosity) {
  // cusom hash function so we can have unique memoized results based on both arguments
  return `${colorValue}_${newLuminosity}`
})

ColorUtils.brightenAbsolute = ColorUtils.alterLuminosity // alias
ColorUtils.darkenAbsolute = ColorUtils.alterLuminosity // alias

export default ColorUtils
