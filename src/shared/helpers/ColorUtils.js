// @flow
import tinycolor from '@ctrl/tinycolor'
import memoizee from 'memoizee'
import { kebabCase, compact } from 'lodash'

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

// creates a CDP URL, this is used anywhere a CDP URL is needed so we're able to change the path of it in one location
export const generateColorDetailsPageUrl = memoizee(function generateColorDetailsPageUrl (color: Color): string {
  const colorNumber = kebabCase(fullColorNumber(color.brandKey, color.colorNumber))
  const colorName = kebabCase(color.name)

  return '/' + compact([
    ROUTE_PARAMS.ACTIVE,
    ROUTE_PARAMS.COLOR_DETAIL,
    color.id,
    `${colorNumber}-${colorName}`
  ]).join('/')
})

export const assembleColorWallPageUrl = memoizee(function assembleColorWallPageUrl (sectionName: string | void, familyName: string | void, colorId: string | void, colorSEO: string | void): string {
  const url = '/' + compact([
    ROUTE_PARAMS.ACTIVE,
    ROUTE_PARAMS.COLOR_WALL,
    sectionName ? `${ROUTE_PARAMS.SECTION}/${sectionName}` : null,
    familyName ? `${ROUTE_PARAMS.FAMILY}/${familyName}` : null,
    colorId ? `${ROUTE_PARAMS.COLOR}/${colorId}` : null,
    colorSEO ? `${colorSEO}` : null
  ]).join('/')

  if (url.slice(-1) === '/') {
    return url.slice(0, -1)
  }

  return url
}, { primitive: true, length: 3 })

export const generateColorWallPageUrl = memoizee(function generateColorWallPageUrl (sectionName: string | void, familyName: string | void, colorId: string | void, colorSEO: string | void): string {
  if (sectionName) {
    sectionName = kebabCase(sectionName)

    if (familyName) {
      familyName = kebabCase(familyName)
    } else {
      familyName = ''
    }

    if (colorId) {
      colorId = kebabCase(colorId)
      colorSEO = kebabCase(colorSEO)
    }
  } else {
    sectionName = familyName = colorId = colorSEO = ''
  }

  return assembleColorWallPageUrl(sectionName, familyName, colorId, colorSEO)
}, { primitive: true, length: 3 })
