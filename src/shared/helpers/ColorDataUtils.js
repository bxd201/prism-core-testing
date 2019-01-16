// @flow
import { fill, flatten, flattenDeep, keys, union, concat } from 'lodash'
import memoizee from 'memoizee'
import { compareKebabs } from './StringUtils'
import { ZOOMED_VIEW_GRID_PADDING } from '../../constants/globals'
import { getTotalWidthOf2dArray } from './DataUtils'
import type { ColorSetPayload, ProbablyColor, ColorGrid, ColorLine, BlankColor } from '../types/Colors'

// -------------------------------------------------------
// BEGIN ConvertColorSetsToGrid
// -------------------------------------------------------

function ConvertColorSetsToGrid (colorSets: string[] = [], colors: ColorSetPayload, brights: ColorSetPayload, BLANK: BlankColor, chunkWidth: number): ColorGrid {
  const padH = ZOOMED_VIEW_GRID_PADDING
  const padV = ZOOMED_VIEW_GRID_PADDING
  let output: ColorGrid = [] // this will be a 2D array of numbers
  let brightOutput = []
  let singleColorSet = false

  let _colorSets = colorSets

  // if we are not provided any colorSets...
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
      let famBrights: ProbablyColor[] = flatten(brights[colorSet])

      if (famBrights && famBrights.length) {
        brightOutput.push(ConvertColorSetsToGrid.extractSegment(0, chunkWidth, famBrights, BLANK))
      }
    })

    if (brightOutput.length) {
      const flatBrights = flatten(ConvertColorSetsToGrid.insertColumnCellsBetweenAndAfter(brightOutput, padH, BLANK))

      if (flatBrights && flatBrights.length) {
        output.push(flatBrights)
        output.push(ConvertColorSetsToGrid.getArrayOfPads(flatBrights.length, BLANK))
      }
    }
  }
  // END GRIDIFYING BRIGHTS
  const firstColorSet = colors[_colorSets[0]]
  const iterations = Math.ceil(getTotalWidthOf2dArray(firstColorSet) / chunkWidth)

  if (singleColorSet) {
    for (let chunkY = 0; chunkY < iterations; chunkY++) {
      let xAxis: (ColorLine | void)[] = []

      firstColorSet.forEach((chunkColors) => {
        xAxis.push(ConvertColorSetsToGrid.extractSegment(chunkY, chunkWidth, chunkColors, BLANK))
      })

      xAxis = ConvertColorSetsToGrid.insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)
      output.push(flatten(xAxis))
    }

    output = ConvertColorSetsToGrid.insertRowAfter(output, padV, BLANK)
  } else {
    firstColorSet.forEach((__, chunkY) => {
      for (let chunkX = 0; chunkX < iterations; chunkX++) {
        // this is a grid that will be flattened into a single line
        let xAxis: (ColorLine | void)[] = []

        _colorSets.forEach((colorSetName) => {
          xAxis.push(ConvertColorSetsToGrid.extractSegment(chunkX, chunkWidth, colors[colorSetName][chunkY], BLANK))
        })

        xAxis = ConvertColorSetsToGrid.insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)
        output.push(flatten(xAxis))
      }

      output = ConvertColorSetsToGrid.insertRowAfter(output, padV, BLANK)
    })
  }

  output = ConvertColorSetsToGrid.insertRowBefore(output, padV, BLANK)
  output = ConvertColorSetsToGrid.insertColumnBefore(output, padH, BLANK)

  return output
}

ConvertColorSetsToGrid.extractSegment = function extractSegment (index: number, segSize: number, whole: ColorLine, BLANK: BlankColor) {
  const start = index * segSize
  const end = start + segSize
  let next = whole.slice(start, end)
  const nl = next.length

  if (nl < segSize) {
    return concat(next, ConvertColorSetsToGrid.getArrayOfPads(segSize - nl, BLANK))
  }

  return next
}

ConvertColorSetsToGrid.insertColumnCellsBetweenAndAfter = function insertColumnCellsBetweenAndAfter (toPad: (ColorLine | BlankColor)[], amt: number, padWith: BlankColor): (ColorLine | BlankColor)[] {
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

ConvertColorSetsToGrid.insertColumnBefore = function insertColumnBefore (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
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

ConvertColorSetsToGrid.insertRowBefore = function insertRowBefore (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  let _new = toPad

  if (amt && _new) {
    const len = _new[0].length

    if (len) {
      while (amt--) {
        _new = concat([ConvertColorSetsToGrid.getArrayOfPads(len, padWith)], _new)
      }
    }
  }

  return _new
}

ConvertColorSetsToGrid.insertRowAfter = function insertRowAfter (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  let _new = toPad

  if (amt && toPad) {
    const len = toPad[0].length

    if (len) {
      while (amt--) {
        _new = concat(_new, [ConvertColorSetsToGrid.getArrayOfPads(len, padWith)])
      }
    }
  }

  return _new
}

ConvertColorSetsToGrid.getArrayOfPads = memoizee(function getArrayOfPads (length: number, padWith: BlankColor): ColorLine {
  return fill(new Array(length), padWith)
}, { primitive: true, length: 2 })

export const convertColorSetsToGrid = ConvertColorSetsToGrid

// -------------------------------------------------------
// END ConvertColorSetsToGrid
// -------------------------------------------------------

export function convertToColorMap (colorData: ColorSetPayload) {
  let colorMap = {}
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

export function isColorFamily (value: string = '', colorSets: string[] = []): boolean {
  return colorSets.filter((colorSet: string) => {
    return compareKebabs(colorSet, value)
  }).length > 0
}
