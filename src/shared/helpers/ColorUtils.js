// @flow
import tinycolor, { mostReadable } from '@ctrl/tinycolor'
import memoizee from 'memoizee'
import kebabCase from 'lodash/kebabCase'
import compact from 'lodash/compact'

import { ROUTE_PARAMS } from 'constants/globals'
import type { Color } from '../types/Colors'

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

export const fullColorNumber = memoizee(function fullColorNumber (brandKey: string | void, colorNumber: string | void, brandKeyNumberSeparator = ' '): string {
  return [brandKey, colorNumber].filter(Boolean).join(brandKeyNumberSeparator)
}, { primitive: true, length: 2 })

export const fullColorName = memoizee(function fullColorName (brandKey: string | void, colorNumber: string | void, name: string, brandKeyNumberSeparator: string | void): string {
  return [fullColorNumber(brandKey, colorNumber, brandKeyNumberSeparator), name].filter(Boolean).join(' ')
}, { primitive: true, length: 3 })

// creates a CDP URL, this is used anywhere a CDP URL is needed so we're able to change the path of it in one location
export const generateColorDetailsPageUrl = memoizee(function generateColorDetailsPageUrl (color: Color): string {
  const colorNumber = kebabCase(fullColorNumber(color.brandKey, color.colorNumber))
  const colorName = cleanColorNameForURL(color.name)

  return '/' + compact([
    ROUTE_PARAMS.ACTIVE,
    ROUTE_PARAMS.COLOR_DETAIL,
    color.id,
    `${colorNumber}-${colorName}`
  ]).join('/')
})

export const generateColorWallPageUrl = memoizee((sectionName = '', familyName = '', colorId = '', colorSEO = ''): string => {
  return `/${compact([
    ROUTE_PARAMS.ACTIVE,
    ROUTE_PARAMS.COLOR_WALL,
    sectionName && `${ROUTE_PARAMS.SECTION}/${kebabCase(sectionName)}`,
    familyName && `${ROUTE_PARAMS.FAMILY}/${kebabCase(familyName)}`,
    colorId && `${ROUTE_PARAMS.COLOR}/${kebabCase(colorId)}`,
    kebabCase(colorSEO)
  ]).join('/')}/`
}, { primitive: true, length: 3 })

export const getContrastYIQ = memoizee((hexcolor: string) => {
  return mostReadable(hexcolor, [ '#000', '#FFF' ]).toHexString()
}, { primitive: true, length: 1 })

export const cleanColorNameForURL = (name: string = ''): string => kebabCase(name.split('-').map((v = '') => {
  const v1 = v.slice(0, 1)
  const v2 = v.slice(1)
  return `${v1.toLowerCase()}${v2}`
}).join(''))
