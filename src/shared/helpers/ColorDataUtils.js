// @flow
import { fill, flatten, flattenDeep, keys, union } from 'lodash'
import { compareKebabs } from './StringUtils'
import { ZOOMED_VIEW_GRID_PADDING } from '../../constants/globals'
import type { ColorFamilyPayload, ProbablyColor, ColorGrid, ColorLine, BlankColor } from '../types/Colors'

export function convertFamiliesToGrid (families: string[] = [], colors: ColorFamilyPayload, brights: ColorFamilyPayload, BLANK: BlankColor, chunkWidth: number): ColorGrid {
  const padH = ZOOMED_VIEW_GRID_PADDING
  const padV = ZOOMED_VIEW_GRID_PADDING
  let output: ColorGrid = [] // this will be a 2D array of numbers
  let brightOutput = []

  let _families = families

  // if we are not provided any families...
  if (_families.length === 0) {
    // ... then effectively display "all" by merging all families from both brights and colors
    _families = Object.keys(colors)

    if (brights) {
      _families = union(_families, Object.keys(brights))
    }
  }

  // BEGIN GRIDIFYING BRIGHTS
  if (brights) {
    _families.forEach((family: string) => {
      let famBrights: ProbablyColor[] = flatten(brights[family])

      if (famBrights && famBrights.length) {
        const len = famBrights.length

        if (len < chunkWidth) {
          brightOutput.push(famBrights.concat(getArrayOfPads(chunkWidth - len, BLANK)))
        }
        brightOutput.push(famBrights)
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

  const firstFamily = colors[_families[0]]

  firstFamily.forEach((__zz, chunkY) => {
    const iterations = Math.ceil(firstFamily[chunkY].length / chunkWidth)

    for (let chunkX = 0; chunkX < iterations; chunkX++) {
      // this is a grid that will be flattened into a single line
      let xAxis: (ColorLine | void)[] = []

      _families.forEach((__xx, family) => {
        const initial = chunkX * chunkWidth
        const end = initial + chunkWidth
        let next = colors[_families[family]][chunkY].slice(initial, end)
        const nl = next.length

        if (nl < chunkWidth) {
          next = next.concat(getArrayOfPads(chunkWidth - nl, BLANK))
        }

        xAxis.push(next)
      })

      xAxis = insertColumnCellsBetweenAndAfter(xAxis, padH, BLANK)

      output.push(flatten(xAxis))
    }
    output = insertRowAfter(output, padV, BLANK)
  })

  output = insertRowBefore(output, padV, BLANK)
  output = insertColumnBefore(output, padH, BLANK)

  return output
}

function insertColumnCellsBetweenAndAfter (toPad: (ColorLine | BlankColor)[], amt: number, padWith: BlankColor): (ColorLine | BlankColor)[] {
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

function insertColumnBefore (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  if (amt && toPad) {
    return toPad.map(el => {
      let _amt = amt
      while (_amt--) {
        el.unshift(padWith)
      }
      return el
    })
  }

  return toPad
}

function insertRowBefore (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  if (amt && toPad) {
    const len = toPad[0].length

    if (len) {
      while (amt--) {
        toPad.unshift(getArrayOfPads(len, padWith))
      }
    }
  }

  return toPad
}

function insertRowAfter (toPad: ColorGrid, amt: number, padWith: BlankColor): ColorGrid {
  if (amt && toPad) {
    const len = toPad[0].length

    if (len) {
      while (amt--) {
        toPad.push(getArrayOfPads(len, padWith))
      }
    }
  }

  return toPad
}

function getArrayOfPads (length: number, padWith: BlankColor): ColorLine {
  return fill(new Array(length), padWith)
}

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
