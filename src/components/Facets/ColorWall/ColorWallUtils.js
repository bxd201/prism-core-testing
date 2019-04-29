// @flow
import findIndex from 'lodash/findIndex'
import concat from 'lodash/concat'
import isEmpty from 'lodash/isEmpty'
import compact from 'lodash/compact'
import isNumber from 'lodash/isNumber'
import memoizee from 'memoizee'
import { ZOOMED_VIEW_GRID_PADDING } from '../../../constants/globals'
import { type ColorIdGrid, type ColorIdLine } from '../../../shared/types/Colors'
import { type GridBounds } from './ColorWall.flow'
import { euclideanDistance } from '../../../shared/helpers/GeometryUtils'
import { getTotalWidthOf2dArray } from '../../../shared/helpers/DataUtils'

// ---------------------------------------------
// INTERNAL FUNCTIONS

const calculateEdgeCompensation = memoizee(function calculateEdgeCompensation (targetAxis: number, edgeAxis: number, radius: number): number {
  const dist = edgeAxis - targetAxis
  let compensation = radius

  if (edgeAxis > targetAxis) {
    // positive value or zero
    compensation = Math.max((radius - dist), 0)
  } else if (edgeAxis < targetAxis) {
    // negative value or zero
    compensation = Math.max((radius + dist), 0)
  }

  if (edgeAxis > 0) {
    compensation *= -1
  }

  return compensation
}, { primitive: true, length: 3 })

// INTERNAL FUNCTIONS
// ---------------------------------------------

// ---------------------------------------------
// EXPORTED FUNCTIONS

export const getColorCoords = memoizee(function getColorCoords (id: string, chunkedColorIds: ColorIdGrid): number[] | void {
  return chunkedColorIds.map((colorRow: ColorIdLine, y: number) => {
    const x = findIndex(colorRow, (colorId: string) => {
      return colorId === id
    })

    if (x >= 0) {
      return [x, y]
    }

    return void (0)
  }).filter(val => !!val).reduce((total, current) => {
    return current || total
  }, void (0))
})

export const drawCircle = memoizee(function drawCircle (radius: number, centerX: number, centerY: number, chunkedColorIds: ColorIdGrid) {
  const TL = { x: ZOOMED_VIEW_GRID_PADDING, y: ZOOMED_VIEW_GRID_PADDING }
  const BR = { x: getTotalWidthOf2dArray(chunkedColorIds) - 1 - ZOOMED_VIEW_GRID_PADDING, y: chunkedColorIds.length - 1 - ZOOMED_VIEW_GRID_PADDING }
  let subsetCoordTL = { x: centerX, y: centerY }
  let subsetCoordBR = { x: centerX, y: centerY }

  // BREAK CIRCLE UPON REACHING CHUNK EDGE
  // Somehow I cannot think of a graceful way to turn these four separate but nearly identical loops
  // into a single function. Please feel free to improve this.
  for (let i = radius; i >= 0; i--) {
    const newY = Math.max(TL.y, subsetCoordTL.y - 1)

    if (chunkedColorIds[newY] && chunkedColorIds[newY][subsetCoordTL.x]) {
      subsetCoordTL.y = newY
      continue
    }

    break
  }

  for (let i = radius; i >= 0; i--) {
    const newX = Math.max(TL.x, subsetCoordTL.x - 1)

    if (chunkedColorIds[subsetCoordTL.y] && chunkedColorIds[subsetCoordTL.y][newX]) {
      subsetCoordTL.x = newX
      continue
    }

    break
  }

  for (let i = radius; i >= 0; i--) {
    const newY = Math.min(BR.y, subsetCoordBR.y + 1)

    if (chunkedColorIds[newY] && chunkedColorIds[newY][subsetCoordBR.x]) {
      subsetCoordBR.y = newY
      continue
    }

    break
  }

  for (let i = radius; i >= 0; i--) {
    const newX = Math.min(BR.x, subsetCoordBR.x + 1)

    if (chunkedColorIds[subsetCoordBR.y] && chunkedColorIds[subsetCoordBR.y][newX]) {
      subsetCoordBR.x = newX
      continue
    }

    break
  }
  // END BREAK CIRCLE

  let compensateX = 0
  let compensateY = 0

  function getCompensateX () {
    return compensateX
  }

  function getCompensateY () {
    return compensateY
  }

  let possibleCorners = [
    TL,
    { x: BR.x, y: TL.y }
  ]

  if ((radius * 2 + 1) < chunkedColorIds.length) {
    possibleCorners = concat(possibleCorners, BR, { x: TL.x, y: BR.y })
  }

  const nearestCorner = possibleCorners.reduce((last, current) => {
    const lastDist = euclideanDistance({ x: centerX, y: centerY }, last)
    const currDist = euclideanDistance({ x: centerX, y: centerY }, current)

    if (currDist < lastDist) {
      return current
    }
    return last
  })

  let levelMap = {}

  for (let x = subsetCoordTL.x; x <= subsetCoordBR.x; x++) {
    for (let y = subsetCoordTL.y; y <= subsetCoordBR.y; y++) {
      let dist = Math.round(euclideanDistance({ x: x, y: y }, { x: centerX, y: centerY }))
      const offsetX = x - centerX
      const offsetY = y - centerY
      const tgtColorId = chunkedColorIds[y][x]

      if (dist > radius || !tgtColorId) {
        continue
      }

      if (offsetX === 0 || offsetY === 0) {
        dist -= 0.5
      }

      dist = Math.min(dist * -1, 0)

      const _compensateX = calculateEdgeCompensation(x - ZOOMED_VIEW_GRID_PADDING, nearestCorner.x - ZOOMED_VIEW_GRID_PADDING, radius)
      const _compensateY = calculateEdgeCompensation(y - ZOOMED_VIEW_GRID_PADDING, nearestCorner.y - ZOOMED_VIEW_GRID_PADDING, radius)

      if (Math.abs(_compensateX) > Math.abs(compensateX)) {
        compensateX = _compensateX
      }

      if (Math.abs(_compensateY) > Math.abs(compensateY)) {
        compensateY = _compensateY
      }

      levelMap[tgtColorId] = {
        level: dist,
        compensateX: getCompensateX,
        compensateY: getCompensateY
      }
    }
  }

  return levelMap
})

export function getCoordsObjectFromPairs (pairs: number[][]) {
  const len = pairs.length
  for (let i = 0; i < len; i++) {
    const pi = pairs[i]
    if (pi && pi.length === 2) {
      return {
        x: pi[0],
        y: pi[1]
      }
    }
  }
}

/**
 * findChunkFromCorner
 * @param {ColorIdGrid} grid - 2D array of null and non-null values
 * @param {number} Ox - X coordinate to begin searching from in provided grid; negative coords wrap to end
 * @param {number} Oy - Y coordinate to begin searching from in provided grid; negative coords wrap to end
 * @param {boolean} [forward=true] - Whether to loop forwards or backwards from origin
 * @returns {GridBounds}
 */
export function findChunkFromCorner (grid: ColorIdGrid, Ox: number = 0, Oy: number = 0, forward: boolean = true, searchPathWidth: number = 0): GridBounds {
  const numRows: number = grid.length

  if (!numRows || !isNumber(Ox) || !isNumber(Oy)) {
    return void (0)
  }

  Oy = (Oy >= 0) ? Oy : numRows + Oy
  Ox = (Ox >= 0) ? Ox : grid[Oy].length + Ox

  let X1: number
  let Y1: number
  let X2: number
  let Y2: number

  // loop over each row; first non-empty row is your Y1
  // after that point, continue to loop until you encounter an empty; the previous index is your Y2
  for (let y = Oy; (forward ? y < numRows : y >= 0); (forward ? y++ : y--)) {
    // start inspecting this row at 0x if going forward, otherwise start at 0 and end at Ox
    const row = grid[y] && (forward ? grid[y].slice(Ox, searchPathWidth ? Ox + searchPathWidth : void (0)) : grid[y].slice(searchPathWidth ? Ox - searchPathWidth : 0, Ox))
    // const row = grid[y] && (forward ? grid[y].slice(Ox) : grid[y].slice(0, Ox))

    // if this row is not empty and we have not set Y1 yet...
    if (!isEmpty(compact(row)) && !isNumber(Y1)) {
      // set it; this is the top of our chunk
      Y1 = y
    } else if (isEmpty(compact(row)) && isNumber(Y1)) {
      // if we encounter an empty row after Y1 has been set...
      // then we need to take the previous index as the bottom of our chunk
      Y2 = (forward ? y - 1 : y + 1)
    }

    // if both y values have been set...
    if (isNumber(Y1) && isNumber(Y2)) {
      // ... break the loop
      break
    }
  }

  // if no Y2 has been set by this point then set it to the last index
  if (!isNumber(Y2)) {
    Y2 = (forward ? grid.length - 1 : 0)
  }

  // if Y values have been set by this point...
  if (isNumber(Y1) && isNumber(Y2)) {
    // ... then let's try to set X values
    const row = grid[Y1]
    const numCols = row.length

    // loop over each col
    for (let x = Ox; (forward ? x < numCols : x >= 0); (forward ? x++ : x--)) {
      const col = row[x]

      // first non-empty column while X1 is empty...
      if (!isEmpty(col) && !isNumber(X1)) {
        X1 = x
      } else if (isEmpty(col) && isNumber(X1)) {
        // if we encounter an empty col and X1 has been set...
        // then set X2 with the previous index
        X2 = (forward ? x - 1 : x + 1)
      }

      // if both x values have been set...
      if (isNumber(X1) && isNumber(X2)) {
        // ... break the loop
        break
      }
    }

    // if no X2 has been set by this point then set it to the last index
    if (!isNumber(X2)) {
      X2 = (forward ? row.length - 1 : 0)
    }

    if (isNumber(X2) && isNumber(X1)) {
      const bounds: GridBounds = {
        TL: forward ? [X1, Y1] : [X2, Y2],
        BR: forward ? [X2, Y2] : [X1, Y1]
      }

      return bounds
    }
  }

  return void (0)
}

/**
 * findContainingChunk
 * @param {ColorIdGrid} grid - 2D array of null and non-null values
 * @param {number} Ox - X coordinate to begin searching from in provided grid; negative coords wrap to end
 * @param {number} Oy - Y coordinate to begin searching from in provided grid; negative coords wrap to end
 * @param {boolean} [forward=true] - Whether to loop forwards or backwards from origin
 * @returns {GridBounds}
 */
export function findContainingChunk (grid: ColorIdGrid, Ox: number = 0, Oy: number = 0): GridBounds {
  const subChunk = findChunkFromCorner(grid, Ox, Oy, false)

  if (subChunk) {
    const wholeChunk = findChunkFromCorner(grid, subChunk.TL[0], subChunk.TL[1])

    if (wholeChunk) {
      return wholeChunk
    }
  }

  return void (0)
}

/**
 * overscanIndicesGetter
 * @param {'horizontal' | 'vertical'} direction - One of "horizontal" or "vertical"
 * @param {number} cellCount - Number of rows or columns in the current axis
 * @param {1 | -1} scrollDirection - 1 (forwards) or -1 (backwards)
 * @param {number} overscanCellsCount - Maximum number of cells to over-render in either direction
 * @param {number} startIndex - Begin of range of visible cells
 * @param {number} stopIndex - End of range of visible cells
 */
export function overscanIndicesGetter ({
  direction,
  cellCount,
  scrollDirection,
  overscanCellsCount,
  startIndex,
  stopIndex
}: Object) {
  // this is needed to get overscan compensation in both directions at all times
  const overscanStartIndex = Math.max(0, startIndex - overscanCellsCount)
  const overscanStopIndex = Math.min(cellCount - 1, stopIndex + overscanCellsCount)

  return {
    overscanStartIndex: overscanStartIndex,
    overscanStopIndex: overscanStopIndex
  }
}

// END EXPORTED FUNCTIONS
// ---------------------------------------------
