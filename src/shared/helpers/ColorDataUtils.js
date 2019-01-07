// @flow
import { fill, flatten, flattenDeep, keys, union, concat } from 'lodash'
import memoizee from 'memoizee'
import { compareKebabs } from './StringUtils'
import { ZOOMED_VIEW_GRID_PADDING } from '../../constants/globals'
import { getTotalWidthOf2dArray } from './DataUtils'
import type { ColorFamilyPayload, ProbablyColor, ColorGrid, ColorLine, BlankColor } from '../types/Colors'

// -------------------------------------------------------
// BEGIN ConvertFamiliesToGrid
// -------------------------------------------------------

function ConvertFamiliesToGrid (families: string[] = [], colors: ColorFamilyPayload, brights: ColorFamilyPayload, BLANK: BlankColor, chunkWidth: number): ColorGrid {
  const padH = ZOOMED_VIEW_GRID_PADDING
  const padV = ZOOMED_VIEW_GRID_PADDING
  let output: ColorGrid = [] // this will be a 2D array of numbers
  let brightOutput = []
  let singleFamily = false

  let _families = families

  // if we are not provided any families...
  if (_families.length === 0) {
    // ... then effectively display "all" by merging all families from both brights and colors
    _families = Object.keys(colors)

    if (brights) {
      _families = union(_families, Object.keys(brights))
    }
  }

  if (_families.length === 1) {
    singleFamily = true
  }

  // BEGIN GRIDIFYING BRIGHTS
  if (brights) {
    _families.forEach((family: string) => {
      let famBrights: ProbablyColor[] = flatten(brights[family])

      if (famBrights && famBrights.length) {
        brightOutput.push(ConvertFamiliesToGrid.extractSegment(0, chunkWidth, famBrights, BLANK))
      }
    })

    if (brightOutput.length) {
      const flatBrights = flatten(ConvertFamiliesToGrid.insertColumnCellsBetweenAndAfter(brightOutput, padH, BLANK))

      if (flatBrights && flatBrights.length) {
        output.push(flatBrights)
        output.push(ConvertFamiliesToGrid.getArrayOfPads(flatBrights.length, BLANK))
      }
    }
  }
  // END GRIDIFYING BRIGHTS

  const firstFamily = colors[_families[0]]
  const iterations = Math.ceil(getTotalWidthOf2dArray(firstFamily) / chunkWidth)

  if (singleFamily) {
    for (let chunkY = 0; chunkY < iterations; chunkY++) {
      let xAxis: (ColorLine | void)[] = []

      firstFamily.forEach((chunkColors) => {
        xAxis.push(ConvertFamiliesToGrid.extractSegment(chunkY, chunkWidth, chunkColors, BLANK))
      })

      xAxis = ConvertFamiliesToGrid.insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)
      output.push(flatten(xAxis))
    }

    output = ConvertFamiliesToGrid.insertRowAfter(output, padV, BLANK)
  } else {
    firstFamily.forEach((__, chunkY) => {
      for (let chunkX = 0; chunkX < iterations; chunkX++) {
        // this is a grid that will be flattened into a single line
        let xAxis: (ColorLine | void)[] = []

        _families.forEach((familyName) => {
          xAxis.push(ConvertFamiliesToGrid.extractSegment(chunkX, chunkWidth, colors[familyName][chunkY], BLANK))
        })

        xAxis = ConvertFamiliesToGrid.insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)
        output.push(flatten(xAxis))
      }

      output = ConvertFamiliesToGrid.insertRowAfter(output, padV, BLANK)
    })
  }

  output = ConvertFamiliesToGrid.insertRowBefore(output, padV, BLANK)
  output = ConvertFamiliesToGrid.insertColumnBefore(output, padH, BLANK)

  return output
}

ConvertFamiliesToGrid.extractSegment = function extractSegment (index: number, segSize: number, whole: ColorLine, BLANK: BlankColor) {
  const start = index * segSize
  const end = start + segSize
  let next = whole.slice(start, end)
  const nl = next.length

  if (nl < segSize) {
    return concat(next, ConvertFamiliesToGrid.getArrayOfPads(segSize - nl, BLANK))
  }

  return next
}

ConvertFamiliesToGrid.insertColumnCellsBetweenAndAfter = function insertColumnCellsBetweenAndAfter (toPad: (ColorLine | BlankColor)[], amt: number, padWith: BlankColor): (ColorLine | BlankColor)[] {
  if (amt && toPad) {
    let returner: (ColorLine | BlankColor)[] = []
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

ConvertFamiliesToGrid.insertColumnBefore = function insertColumnBefore (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
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

ConvertFamiliesToGrid.insertRowBefore = function insertRowBefore (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  let _new = toPad

  if (amt && _new) {
    const len = _new[0].length

    if (len) {
      while (amt--) {
        _new = concat([ConvertFamiliesToGrid.getArrayOfPads(len, padWith)], _new)
      }
    }
  }

  return _new
}

ConvertFamiliesToGrid.insertRowAfter = function insertRowAfter (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  let _new = toPad

  if (amt && toPad) {
    const len = toPad[0].length

    if (len) {
      while (amt--) {
        _new = concat(_new, [ConvertFamiliesToGrid.getArrayOfPads(len, padWith)])
      }
    }
  }

  return _new
}

ConvertFamiliesToGrid.getArrayOfPads = memoizee(function getArrayOfPads (length: number, padWith: BlankColor): ColorLine {
  return fill(new Array(length), padWith)
}, { primitive: true, length: 2 })

export const convertFamiliesToGrid = ConvertFamiliesToGrid

// -------------------------------------------------------
// END ConvertFamiliesToGrid
// -------------------------------------------------------

export function convertToColorMap (colorData: ColorFamilyPayload) {
  let colorMap = {}
  // $FlowIgnore -- flow doesn't realize keys can be used with ANY iterable object, array or otherwise
  const data = keys(colorData).map(key => {
    return colorData[key]
  })

  flattenDeep(data).forEach(color => {
    if (color) {
      colorMap[color.id] = color
    }
  })

  return colorMap
}

export function isColorFamily (value: string = '', families: string[] = []): boolean {
  return families.filter((family: string) => {
    return compareKebabs(family, value)
  }).length > 0
}
