import { type Color } from '../types'
import colors from './mocked-endpoints/colors.json'

/**
 * @file functions used by tests and stories, a component should not import anything from this file
 */

/**
 * @description All colors by name key
 * @returns { [key: string]: Color } object of all colors (example: { 'A La Mode': Color, ... })
 */
export const colorOptions: { [key: string]: Color } = colors.reduce(
  (map, { id, hex, brandKey, colorNumber, name, coordinatingColors }: Color) => {
    map[`${name}`] = { id, hex, brandKey, colorNumber, coordinatingColors, name }
    return map
  },
  {}
)

/**
 * @description Gets all colors
 * @returns {{ [key: number]: Color }} object of all colors  (example: { 1544: Color, ... })
 */
export const getColorMap = (): { [key: number]: Color } =>
  colors.reduce((map, c) => {
    map[c.id] = c
    return map
  }, {})

/**
 * @description Gets random color name
 * @returns {string} random color name
 */
export const getRandomColorName = (): string => Object.keys(colorOptions)[Math.floor(Math.random() * colors.length)]
