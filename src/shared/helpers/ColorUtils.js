// @flow
import tinycolor from '@ctrl/tinycolor'
import memoizee from 'memoizee'

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

export const alterLuminosity = memoizee(_alterLuminosity, function (colorValue, newLuminosity) {
  // cusom hash function so we can have unique memoized results based on both arguments
  return `${colorValue}_${newLuminosity}`
}, { primitive: true, length: 2 })

export const brightenAbsolute = alterLuminosity // alias
export const darkenAbsolute = alterLuminosity // alias

export const fullColorNumber = memoizee(function fullColorNumber (brandKey: string | void, colorNumber: string | void): string {
  let colorNamePrefix = colorNumber ? colorNumber + ' ' : ''

  if (colorNamePrefix && brandKey) {
    colorNamePrefix = brandKey + ' ' + colorNamePrefix
  }

  return colorNamePrefix
}, { primitive: true, length: 2 })

export const fullColorName = memoizee(function fullColorName (brandKey: string | void, colorNumber: string | void, name: string): string {
  return `${fullColorNumber(brandKey, colorNumber)}${name}`
}, { primitive: true, length: 3 })
