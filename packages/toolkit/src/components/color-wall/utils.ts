import { chunk, take, clamp, rangeRight, drop } from 'lodash'
import { Color } from '../../types'

export interface ScrollPosition {
  scrollLeft: number
  scrollTop: number
}

export const getWidthOfWidestChunkRowInChunkGrid = (grid: Color[][][][]): number => {
  return grid ? grid.reduce((widest, chunkRow) => Math.max(widest, getWidthOfChunkRow(chunkRow)), 0) : 0
}

// return the total width (in cells) of a chunk row
export const getWidthOfChunkRow = (chunkRow: Color[][][]): number => {
  return chunkRow.reduce((width, chunk) => width + getLongestArrayIn2dArray(chunk), 0)
}

// return the length of the longest array in an array of arrays
export const getLongestArrayIn2dArray = (arr: any[]): number =>
  arr ? arr.reduce((n, arr) => Math.max(n, arr.length), 0) : 0

// return the height (in cells) of the tallest chunk in a chunkRow
export const getHeightOfChunkRow = (chunkRow: Color[][][]): number => {
  return chunkRow ? chunkRow.reduce((highest, chunk) => Math.max(highest, chunk.length), 0) : 0
}

// build a 4d "chunk grid" based on a list of chunks, parameters and a container width
export const makeChunkGrid = (
  unChunkedChunks: Color[][],
  chunkGridParams: {
    gridWidth: number
    chunkWidth: number
    chunkHeight?: number
    firstRowLength?: number
    wrappingEnabled: boolean
  },
  containerWidth: number
): Color[][][][] => {
  const { gridWidth, chunkWidth, chunkHeight, firstRowLength, wrappingEnabled } = chunkGridParams

  const chunkedChunks: Color[][][] = unChunkedChunks.map((unChunkedChunk) => {
    const chunkRowLength = chunkHeight ? Math.max(unChunkedChunk.length / chunkHeight, 1) : chunkWidth
    return chunk(unChunkedChunk, chunkRowLength)
  })

  // calculate a max grid width by decreasing it until it is less than the (containerWidth - 3)
  const maxGridRowLength = rangeRight(1, gridWidth + 1).find(
    (w) => getWidthOfWidestChunkRowInChunkGrid(chunk(chunkedChunks, w)) < containerWidth - 3
  )

  const wrapChunks = (chunkedChunks: Color[][][]): Color[][][][] => {
    return chunk(chunkedChunks, wrappingEnabled ? maxGridRowLength : gridWidth)
  }

  if (firstRowLength !== undefined) {
    return [take(chunkedChunks, firstRowLength), ...wrapChunks(drop(chunkedChunks, firstRowLength))]
  }

  return wrapChunks(chunkedChunks)
}

// returns coordinates of a value in a balanced multi-dimensional array
export const getCoords = (arr: any[], val: any): number[] => {
  if (!Array.isArray(arr)) {
    return [-1]
  } else if (arr.every(Array.isArray)) {
    return arr.map((subArr, i) => [i, ...getCoords(subArr, val)]).find((coords) => coords[1] !== -1) ?? [-1]
  } else {
    return [arr.indexOf(val)]
  }
}

// return scroll offsets (in pixels) for a specific grid, color, and container dimensions
export const computeFinalScrollPosition = (
  grid: Color[][][][],
  color: Color,
  containerWidth: number,
  containerHeight: number,
  paddingBetweenChunks: number = 0.4
): ScrollPosition => {
  const [chunkRow, chunkColumn, row, column] = getCoords(grid, color)

  const widthOfChunksToTheLeft = take(grid[chunkRow], chunkColumn).reduce(
    (w, chunk) => w + paddingBetweenChunks + getLongestArrayIn2dArray(chunk),
    0
  )
  const heightOfChunksAbove =
    take(grid, chunkRow).reduce((h, chunkRow, i) => h + paddingBetweenChunks + getHeightOfChunkRow(chunkRow), 0) + 2

  const totalGridWidth =
    (grid.reduce(
      (w, chunkRow) => Math.max(w, getWidthOfChunkRow(chunkRow) + paddingBetweenChunks * chunkRow.length),
      0
    ) +
      2) *
      50 -
    containerWidth

  const totalGridHeight =
    (grid.reduce((h, chunkRow, i) => h + paddingBetweenChunks + getHeightOfChunkRow(chunkRow), 0) + 2) * 50 -
    containerHeight

  return {
    scrollLeft: clamp((widthOfChunksToTheLeft + column) * 50 - containerWidth / 2, 0, totalGridWidth),
    scrollTop: clamp((heightOfChunksAbove + row) * 50 - containerHeight / 2, 0, totalGridHeight)
  }
}

// calculate increments between a start and end scroll position based on elapsed time
export const getScrollStep = (start: ScrollPosition, end: ScrollPosition, elapsed: number): ScrollPosition => {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const getVal = (start, end): number => (elapsed > 500 ? end : start + (end - start) * (elapsed / 500))
  return {
    scrollLeft: getVal(start.scrollLeft, end.scrollLeft),
    scrollTop: getVal(start.scrollTop, end.scrollTop)
  }
}
