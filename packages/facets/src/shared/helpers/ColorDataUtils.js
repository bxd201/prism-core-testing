// @flow
import fill from 'lodash/fill'
import flattenDeep from 'lodash/flattenDeep'
import keys from 'lodash/keys'
import concat from 'lodash/concat'
import uniq from 'lodash/uniq'
import max from 'lodash/max'
// import range from 'lodash/range'
import mapValues from 'lodash/mapValues'
import intersection from 'lodash/intersection'
import memoizee from 'memoizee'
import { tinycolor as tc, type tinycolor as TinyColor } from '@ctrl/tinycolor'
import { compareKebabs } from './StringUtils'
import { ZOOMED_VIEW_GRID_PADDING } from '../../constants/globals'
import { formToGridWithAspectRatio, type GridShape } from './DataUtils'
import type { CategorizedColorIdGrid, CategorizedColorGrid, ProbablyColor, ColorIdGrid, ColorIdLine, BlankColor, Color, ColorMap, ColorIdList, ColorList } from '../types/Colors'
import { mapItemsToList } from '../utils/tintableSceneUtils'
import { createMiniColorFromColor } from '../../components/SingleTintableSceneView/util'
import type { Surface } from '../types/Scene'

function ColorInstance (color: Object | Color) {
  for (const prop in color) {
    if (color.hasOwnProperty(prop)) {
      this[prop] = color[prop]
    }
  }
}

// $FlowIgnore -- flow doesn't want us overriding toString, but we don't care what it wants
ColorInstance.prototype.toString = function (): string {
  return this.id
}

// -------------------------------------------------------
// BEGIN convertCategorizedColorsToGrid
// -------------------------------------------------------

const getArrayOfPads = memoizee(function getArrayOfPads (length: number, padWith: BlankColor): ColorIdLine {
  return fill(new Array(length), padWith)
}, { primitive: true, length: 2 })

function insertColumnBefore (toPad: ColorIdGrid, amt: number, padWith: BlankColor): ColorIdGrid {
  if (amt && toPad) {
    return toPad.map(el => {
      let _amt = amt
      let _new = el

      while (_amt--) {
        _new = concat(padWith, _new)
      }
      return _new
    })
  }

  return toPad
}

function insertColumnAfter (toPad: ColorIdGrid, amt: number, padWith: BlankColor): ColorIdGrid {
  if (amt && toPad) {
    return toPad.map(el => {
      let _amt = amt
      let _new = el

      while (_amt--) {
        _new = concat(_new, padWith)
      }
      return _new
    })
  }

  return toPad
}

function insertRowBefore (toPad: ColorIdGrid, amt: number, padWith: BlankColor): ColorIdGrid {
  let _new = toPad

  if (amt && _new) {
    const len = _new[0].length

    if (len) {
      while (amt--) {
        _new = concat([getArrayOfPads(len, padWith)], _new)
      }
    }
  }

  return _new
}

function insertRowAfter (toPad: ColorIdGrid, amt: number, padWith: BlankColor): ColorIdGrid {
  let _new = toPad

  if (amt && toPad) {
    const len = toPad[0].length

    if (len) {
      while (amt--) {
        _new = concat(_new, [getArrayOfPads(len, padWith)])
      }
    }
  }

  return _new
}

function fillGrid (toPad: ColorIdGrid, padWith: BlankColor): ColorIdGrid {
  const rowWidths = uniq(toPad.map((row) => row.length))

  // if we only have one unique row width...
  if (rowWidths.length === 1) {
    // then we're already square! return our grid
    return toPad
  }

  const maxWidth = max(rowWidths)
  return toPad.map(row => {
    const thisWidth = row.length
    if (thisWidth < maxWidth) {
      return concat(row, getArrayOfPads((maxWidth - thisWidth), padWith))
    }
    return row
  })
}

// -------------------------------------------------------
// END convertCategorizedColorsToGrid
// -------------------------------------------------------

export function convertUnorderedColorsToGrid (
  colorSets: string[] = [],
  colors: ColorIdList,
  colorMap: ColorMap,
  aspectRatio: number,
  BLANK: BlankColor
): ColorIdGrid {
  const padH = ZOOMED_VIEW_GRID_PADDING
  const padV = ZOOMED_VIEW_GRID_PADDING
  let output: ColorIdGrid = [] // this will be a 2D array of numbers
  let _colors

  // if we are provided color sets...
  if (colorSets.length) {
    const matchingColorIds = Object.keys(colorMap).filter((id: string) => {
      return intersection(colorMap[id].colorFamilyNames, colorSets).length > 0
    })
    _colors = intersection(colors, matchingColorIds)
  } else {
    _colors = colors
  }

  const shape: GridShape = formToGridWithAspectRatio(_colors.length, aspectRatio)

  for (let i = 0; i < shape.rows; i++) {
    // $FlowIgnore -- there will never be undefined values here to conflict with ColorIdGrid
    output.push(_colors.slice(i * shape.cols, (i + 1) * shape.cols))
  }

  output = fillGrid(output, BLANK)
  output = insertRowBefore(output, padV, BLANK)
  output = insertRowAfter(output, padV, BLANK)
  output = insertColumnBefore(output, padH, BLANK)
  output = insertColumnAfter(output, padH, BLANK)

  return output
}

export function convertCategorizedColorsToClasses (colorData: CategorizedColorGrid): CategorizedColorGrid {
  return mapValues(colorData, (obj: Object) => {
    return obj.map((row: Color[]) => {
      return row.map((color: Color) => new ColorInstance(color))
    })
  })
}

export function convertUnorderedColorsToClasses (colorData: ColorList): ColorList {
  return colorData.map((color: any) => {
    // $FlowIgnore -- flow's confused. this is fine.
    return new ColorInstance(color)
  })
}

export function convertCategorizedColorsToIds (colorData: CategorizedColorGrid): CategorizedColorIdGrid {
  return mapValues(colorData, (obj: Object) => {
    return obj.map((row: Color[]) => {
      return row.map((color: Color) => color.id)
    })
  })
}

export function convertUnorderedColorsToColorMap (colorData: ColorList): ColorMap {
  const colorMap = {}

  flattenDeep(colorData).forEach((color: ProbablyColor) => {
    if (color) {
      colorMap[color.id] = color
    }
  })

  return colorMap
}

export function convertCategorizedColorsToColorMap (colorData: CategorizedColorGrid): ColorMap {
  const colorMap = {}
  const data = keys(colorData).map(key => {
    return colorData[key]
  })

  flattenDeep(data).forEach((color: ProbablyColor) => {
    if (color) {
      colorMap[color.id] = color
    }
  })

  return colorMap
}

export function isColorFamily (value: string = '', colorSets: string[] = []): boolean {
  return colorSets.filter((colorSet: string) => {
    return compareKebabs(colorSet, value)
  }).length > 0
}

export const tinycolor = memoizee((color: string): TinyColor => tc(color), { primitive: true, length: 1 })

// lower step values produce broader hue categories
// this is useful for making more general color groups
export const getHueRangeNumber = memoizee((hue: number, steps: number = 12) => {
  const degreeOffset = 360 / steps / 2

  let n = hue + degreeOffset
  n = (n >= 360 ? n - 360 : n)
  return Math.floor(n * steps / 360)
}, { primitive: true, length: 2 })

// returns shortest distance between two degrees in degrees
export const getDegreeDistance = memoizee((h1, h2) => {
  const diff = h2 > h1 ? h2 - h1 : h1 - h2
  const diff2 = diff > 180 ? 360 - diff : diff
  return diff2
}, { primitive: true, length: 2 })

export const getColorByBrandAndColorNumber = (brand: string, colorNumber: string, colors: any) => {
  const foundId = Object.keys(colors.colorMap)
    .find(colorId => {
      const result = colors.colorMap[colorId].colorNumber === colorNumber &&
        colors.colorMap[colorId].brandKey.toLowerCase() === brand.toLowerCase()

      return result
    })

  return foundId ? colors.colorMap[foundId] : null
}

export const getMiniColorForSurfacesFromColorStrings = (defColors: string[], surfaces: Surface[], colors: any) => {
  return mapItemsToList(defColors, surfaces).map(colorKey => {
    const [brand, colorId] = colorKey?.split('-') ?? [null, null]
    return colorId ? getColorByBrandAndColorNumber(brand, colorId, colors) : null
  }).map(color => color ? createMiniColorFromColor(color) : null)
}
