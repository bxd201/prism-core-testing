// @flow
import fill from 'lodash/fill'
import flatten from 'lodash/flatten'
import flattenDeep from 'lodash/flattenDeep'
import keys from 'lodash/keys'
import concat from 'lodash/concat'
import uniq from 'lodash/uniq'
import max from 'lodash/max'
import mapValues from 'lodash/mapValues'
import union from 'lodash/union'
import intersection from 'lodash/intersection'
import memoizee from 'memoizee'
import { compareKebabs } from './StringUtils'
import { ZOOMED_VIEW_GRID_PADDING } from '../../constants/globals'
import { getTotalWidthOf2dArray, formToGridWithAspectRatio, type GridShape } from './DataUtils'
import type { CategorizedColorIdGrid, CategorizedColorGrid, ProbablyColorId, ProbablyColor, ColorIdGrid, ColorIdLine, BlankColor, Color, ColorMap, ColorIdList, ColorList } from '../types/Colors'

function ColorInstance (color: Object | Color) {
  for (let prop in color) {
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

function extractSegment (index: number, segSize: number, whole: ColorIdLine, BLANK: BlankColor) {
  const start = index * segSize
  const end = start + segSize
  let next = whole.slice(start, end)
  const nl = next.length

  if (nl < segSize) {
    return concat(next, getArrayOfPads(segSize - nl, BLANK))
  }

  return next
}

function insertColumnCellsBetweenAndAfter (toPad: (ColorIdLine | BlankColor)[], amt: number, padWith: BlankColor): (ColorIdLine | BlankColor)[] {
  if (amt && toPad) {
    let returner: (ColorIdLine | BlankColor)[] = []
    toPad.forEach((__yy, i) => {
      let _amt = amt
      returner.push(toPad[i])

      while (_amt--) {
        returner.push(padWith)
      }
    })

    return returner
  }

  return toPad
}

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

export function convertCategorizedColorsToGrid (colorSets: string[] = [], colors: CategorizedColorIdGrid, brights: CategorizedColorIdGrid, colorMap: ColorMap, BLANK: BlankColor, chunkWidth: number): ColorIdGrid {
  const padH = ZOOMED_VIEW_GRID_PADDING
  const padV = ZOOMED_VIEW_GRID_PADDING
  let output: ColorIdGrid = [] // this will be a 2D array of numbers
  let brightOutput = []
  let singleColorSet = false

  let _colorSets = colorSets

  if (_colorSets.length === 0) {
    // ... then effectively display "all" by merging all colorSets from both brights and colors
    _colorSets = Object.keys(colors)

    if (brights) {
      _colorSets = union(_colorSets, Object.keys(brights))
    }
  }

  if (_colorSets.length === 1) {
    singleColorSet = true
  }

  // BEGIN GRIDIFYING BRIGHTS
  if (brights) {
    _colorSets.forEach((colorSet: string) => {
      let famBrights: ProbablyColorId[] = flatten(brights[colorSet])

      if (famBrights && famBrights.length) {
        brightOutput.push(extractSegment(0, chunkWidth, famBrights, BLANK))
      }
    })

    if (brightOutput.length) {
      const flatBrights = flatten(insertColumnCellsBetweenAndAfter(brightOutput, padH, BLANK))

      if (flatBrights && flatBrights.length) {
        output.push(flatBrights)
        output.push(getArrayOfPads(flatBrights.length, BLANK))
      }
    }
  }
  // END GRIDIFYING BRIGHTS
  const firstColorSet = colors[_colorSets[0]]
  const iterations = Math.ceil(getTotalWidthOf2dArray(firstColorSet) / chunkWidth)

  if (singleColorSet) {
    for (let chunkY = 0; chunkY < iterations; chunkY++) {
      let xAxis: (ColorIdLine | void)[] = []

      firstColorSet.forEach((chunkColors) => {
        xAxis.push(extractSegment(chunkY, chunkWidth, chunkColors, BLANK))
      })

      xAxis = insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)
      output.push(flatten(xAxis))
    }

    output = insertRowAfter(output, padV, BLANK)
  } else {
    firstColorSet.forEach((__, chunkY) => {
      for (let chunkX = 0; chunkX < iterations; chunkX++) {
        // this is a grid that will be flattened into a single line
        let xAxis: (ColorIdLine | void)[] = []

        _colorSets.forEach((colorSetName) => {
          xAxis.push(extractSegment(chunkX, chunkWidth, colors[colorSetName][chunkY], BLANK))
        })

        xAxis = insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)
        output.push(flatten(xAxis))
      }

      output = insertRowAfter(output, padV, BLANK)
    })
  }

  output = fillGrid(output, BLANK)
  output = insertRowBefore(output, padV, BLANK)
  output = insertColumnBefore(output, padH, BLANK)

  return output
}

// -------------------------------------------------------
// END convertCategorizedColorsToGrid
// -------------------------------------------------------

export function convertUnorderedColorsToGrid (colorSets: string[] = [], colors: ColorIdList, colorMap: ColorMap, aspectRatio: number, BLANK: BlankColor): ColorIdGrid {
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
  let colorMap = {}

  flattenDeep(colorData).forEach((color: ProbablyColor) => {
    if (color) {
      colorMap[color.id] = color
    }
  })

  return colorMap
}

export function convertCategorizedColorsToColorMap (colorData: CategorizedColorGrid): ColorMap {
  let colorMap = {}
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
