// @flow
import chunk from 'lodash/chunk'
import clamp from 'lodash/clamp'
import drop from 'lodash/drop'
import flatten from 'lodash/flatten'
import rangeRight from 'lodash/rangeRight'
import take from 'lodash/take'
import memoizee from 'memoizee'
import { type ChunkGridParams, type ScrollPosition } from 'src/shared/types/Actions.js.flow'

// returns coordinates of a value in a balanced multi-dimensional array
export const getCoords = memoizee((arr: any[], val): number[] => {
  if (!Array.isArray(arr)) {
    return [-1]
  } else if (arr.every(Array.isArray)) {
    return arr.map((subArr: any[], i: number): number[] => [i, ...getCoords(subArr, val)]).find(coords => coords[1] !== -1) || [-1]
  } else {
    return [arr.indexOf(val)]
  }
})

export const getLongestArrayIn2dArray = memoizee((arr: any[][]): number => arr ? arr.reduce((n, arr) => Math.max(n, arr.length), 0) : 0)

// return the total width (in cells) of a chunk row
const getWidthOfChunkRow = (chunkRow: string[][][]): number => chunkRow.reduce((width, chunk) => width + getLongestArrayIn2dArray(chunk), 0)

// return the height (in cells) of the tallest chunk in a chunkRow
export const getHeightOfChunkRow = memoizee((chunkRow: string[][][]): number => {
  return chunkRow ? chunkRow.reduce((highest, chunk) => Math.max(highest, chunk.length), 0) : 0
})

// return the width (in cells) of the widestChunk in a chunk grid
export const getWidthOfWidestChunkRowInChunkGrid = memoizee((grid: ?string[][][][]): number => {
  return grid ? grid.reduce((widest, chunkRow) => Math.max(widest, getWidthOfChunkRow(chunkRow)), 0) : 0
})

export const getLevelMap = memoizee((chunkGrid: string[][][][], bloomEnabled: boolean, centerId: ?string): { [string]: number } => {
  if (!centerId) return {}
  // find chunk with active centerId
  for (const chunk of flatten(chunkGrid)) {
    const [row: number, column: number] = getCoords(chunk, centerId)
    if (row === -1) { continue }

    const levelMap: { [string]: number } = {}

    const setLevels = (level: number, indexes: [number, number][]) => {
      indexes.forEach(([row, column]: [number, number]) => chunk[row] && chunk[row][column] !== undefined && (levelMap[chunk[row][column]] = level))
    }

    // center is 0
    levelMap[centerId] = 0

    if (!bloomEnabled) { return levelMap }

    // close above/below/left/right is -0.5
    setLevels(-0.5, [[row + 1, column], [row - 1, column], [row, column + 1], [row, column - 1]])
    // close diagonals gets -1
    setLevels(-1, [[row + 1, column + 1], [row - 1, column + 1], [row + 1, column - 1], [row - 1, column - 1]])
    // far above/below/left/right gets -1.5
    setLevels(-1.5, [[row + 2, column], [row - 2, column], [row, column + 2], [row, column - 2]])
    // far diagonals get -2
    setLevels(-2, [[row + 2, column + 1], [row + 2, column - 1], [row - 2, column + 1], [row - 2, column - 1], [row + 1, column + 2], [row - 1, column + 2], [row + 1, column - 2], [row - 1, column - 2]])

    return levelMap
  }

  return {}
})

// reports on whether there are any labels defined for a specific row in a grid
export const rowHasLabels = memoizee((grid: string[][][][], rowIndex: number, labels: ?(?string)[]): boolean => {
  if (grid === undefined || labels === undefined || grid.length <= rowIndex) { return false }
  const numElementsBeforeRow: number = flatten(take(grid, rowIndex)).length
  return labels.length > numElementsBeforeRow && take(drop(labels, numElementsBeforeRow), grid[rowIndex].length).some(label => label !== undefined)
})

/**
 * @param {*} grid
 * @param {*} paddingBetweenChunks spacing between chunks in cells
 * @param {*} labels the labels array, when a chunkrow has a label it is considered to be 1.6 cells taller
 * @returns total grid height in cells
 */
export const getTotalGridHeight = (grid: string[][][][], paddingBetweenChunks: number, labels: (?string)[]) => (
  grid.reduce((h, chunkRow, i) => h + paddingBetweenChunks + getHeightOfChunkRow(chunkRow) + (rowHasLabels(grid, i, labels) ? 1.6 : 0), 0) + 2
)

/**
 * @param {*} grid
 * @param {*} paddingBetweenChunks spacing between chunks in cells
 * @returns total grid width in cells
 */
export const getTotalGridWidth = (grid: string[][][][], paddingBetweenChunks: number) => (
  grid.reduce((w, chunkRow) => Math.max(w, getWidthOfChunkRow(chunkRow) + paddingBetweenChunks * chunkRow.length), 0) + 2
)

// return scroll offsets (in pixels) for a specific grid, color, and container dimensions
export const computeFinalScrollPosition = (
  grid: string[][][][],
  color: ?(string | number),
  containerWidth: number,
  containerHeight: number,
  labels: (?string)[],
  paddingBetweenChunks: number = 0.4
): ScrollPosition => {
  const [chunkRow: number, chunkColumn: number, row: number, column: number] = getCoords(grid, color)

  const widthOfChunksToTheLeft = take(grid[chunkRow], chunkColumn).reduce((w, chunk) => w + paddingBetweenChunks + getLongestArrayIn2dArray(chunk), 0)
  const heightOfChunksAbove = take(grid, chunkRow).reduce((h, chunkRow, i) => h + paddingBetweenChunks + getHeightOfChunkRow(chunkRow) + (rowHasLabels(grid, i, labels) ? 2 : 0), 0) + 2
  const totalGridWidth = getTotalGridWidth(grid, paddingBetweenChunks) * 50 - containerWidth
  const totalGridHeight = getTotalGridHeight(grid, paddingBetweenChunks, labels) * 50 - containerHeight

  return {
    scrollLeft: clamp((widthOfChunksToTheLeft + column) * 50 - containerWidth / 2, 0, totalGridWidth),
    scrollTop: clamp((heightOfChunksAbove + row) * 50 - containerHeight / 2, 0, totalGridHeight)
  }
}

export const getScrollStep = memoizee((start: ScrollPosition, end: ScrollPosition, elapsed: number): ScrollPosition => {
  const getVal = (start: number, end: number): number => elapsed > 500 ? end : start + (end - start) * (elapsed / 500)
  return {
    scrollLeft: getVal(start.scrollLeft, end.scrollLeft),
    scrollTop: getVal(start.scrollTop, end.scrollTop)
  }
})

export const makeChunkGrid = memoizee((unChunkedChunks: number[][], chunkGridParams: ChunkGridParams = {}, containerWidth: number, isFamily: boolean): string[][][][] => {
  const { gridWidth, chunkWidth, chunkHeight, firstRowLength, wrappingEnabled } = chunkGridParams

  const chunkedChunks: string[][][] = unChunkedChunks
    // convert chunk to strings because that is what the color wall currently expects
    .map((unChunkedChunk: number[]): string[] => unChunkedChunk.map(id => id.toString()))
    .map((unChunkedChunk: string[]): string[][] => {
      const chunkRowLength: ?number = chunkHeight ? unChunkedChunk.length / chunkHeight : chunkWidth
      return chunk(unChunkedChunk, chunkRowLength)
    })

  const wrapChunks = (chunkedChunks: string[][][]): string[][][][] => {
    return wrappingEnabled
      // determine gridWidth by decreasing it until it is less than the containerWidth
      ? chunk(chunkedChunks, rangeRight(1, gridWidth + 1).find(w => getWidthOfWidestChunkRowInChunkGrid(chunk(chunkedChunks, w)) < containerWidth - 3))
      : chunk(chunkedChunks, gridWidth)
  }

  return firstRowLength
    ? [take(chunkedChunks, firstRowLength), ...wrapChunks(drop(chunkedChunks, firstRowLength))]
    : wrapChunks(chunkedChunks)
})

// Calculate the height of the color wall section label depending on the size of cell size
export const calculateLabelHeight = (cellSize: number): number => {
  if (cellSize > 29.20 || (cellSize <= 24 && cellSize > 20.90)) {
    return cellSize * 1
  } else if (cellSize < 20.89) {
    return cellSize * 2.1
  } else {
    return cellSize * 1.5
  }
}

// Calculate the bottom margin of the color wall section label depending on the size of cell size
export const calculateLabelMarginBottom = (isZoomedIn: boolean, cellSize: number): number => (
  cellSize * (isZoomedIn ? 0.6 : 0.2)
)
