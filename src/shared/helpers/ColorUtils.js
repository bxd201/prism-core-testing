// @flow
import tinycolor from '@ctrl/tinycolor'
import { memoize } from 'lodash'

/**
 * @param {*} colorValue String, hex, or tinycolor-compatible rgb(a)/hsl(a)/hsv(a) object
 * @param {number} newLuminosity number between 0 and 100
 * @description Takes a color in any tinycolor-compatible format and adjusts its luminosity to an absolute value between 0 and 100
 */
function _alterLuminosity (colorValue: any, newLuminosity: number): TinyColor {
  const tc = tinycolor(colorValue)
  const hsl = tc.toHsl()
  return tinycolor(`hsl(${hsl.h}, ${hsl.s * 100}%, ${newLuminosity}%)`)
}

export const alterLuminosity = memoize( _alterLuminosity, function (colorValue, newLuminosity) {
  // cusom hash function so we can have unique memoized results based on both arguments
  return `${colorValue}_${newLuminosity}`
})

export const brightenAbsolute = alterLuminosity // alias
export const darkenAbsolute = alterLuminosity // alias
