// @flow
import memoizee from 'memoizee'

export const getWidthOf2dArray = memoizee((arr: any[][]): number => arr.reduce((widest, arr) => Math.max(widest, arr.length), 0))

export const getWidthOf3dArray = memoizee((arr: any[][][]): number => arr.reduce((widest, arr) => Math.max(widest, getWidthOf2dArray(arr)), 0))

export const getWidthOf4dArray = memoizee((arr: any[][][][]): number => arr.reduce((widest, arr) => Math.max(widest, arr.length * getWidthOf3dArray(arr)), 0))

export const findIndexIn2dArray = memoizee((id: ?any, arr: any[][]): [number, number] => {
  let column: number = -1
  let row: number = arr.findIndex((row: any[]): boolean => (column = row.indexOf(id)) !== -1)
  return [row, column]
})

export const convertToChunkArray = memoizee((layout: string[][][][]): string[][][][] => {
  return layout.map((chunkRow: string[][][]) => {
    const chunks: string[][][] = chunkRow[0].map(() => [])
    chunkRow.forEach((row: string[][]) => {
      row.forEach((r: string[], chunkIndex: number) => chunks[chunkIndex].push(r))
    })
    return chunks
  })
})

export const getLevelMap = memoizee((chunkGrid: string[][][][], centerId: ?string): { [string]: number } => {
  if (!centerId) return {}
  // find chunk with active centerId
  for (const chunk of chunkGrid.flat()) {
    const [row: number, column: number] = findIndexIn2dArray(centerId, chunk)
    if (row === -1) { continue }

    let levelMap: { [string]: number } = {}

    const setLevels = (level: number, indexes: [number, number][]) => {
      indexes.forEach(([row, column]: [number, number]) => chunk[row] && chunk[row][column] !== undefined && (levelMap[chunk[row][column]] = level))
    }

    // center is 0
    levelMap[centerId] = 0
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

const getMaxWidth = memoizee((chunks: string[][][][], marginSize: number, cellSize: number, gridWidth: number): number => {
  return chunks[0].reduce((widthSoFar, chunk) => widthSoFar + marginSize + chunk[0].length * cellSize, 2 * cellSize) - gridWidth
})

const getMaxHeight = memoizee((chunks: string[][][][], marginSize: number, cellSize: number, gridHeight: number): number => {
  return chunks.map(chunkRow => chunkRow[0]).reduce((heightSoFar, chunk) => heightSoFar + marginSize + chunk.length * cellSize, 2 * cellSize) - gridHeight
})

export const getScrollPosition = memoizee((activeColor: string, chunks: string[][][][], marginSize: number, cellSize: number, gridWidth: number, gridHeight: number): { scrollLeft: number, scrollTop: number } => {
  let scrollLeft = 0
  let scrollTop = 0
  chunks.findIndex((chunkRow: string[][][]): boolean => {
    scrollLeft = 0
    scrollTop += chunkRow[0].length * cellSize + marginSize
    return chunkRow.findIndex((chunk: string[][]): boolean => {
      const [row: number, column: number] = findIndexIn2dArray(activeColor, chunk)
      row !== -1 && (scrollTop += (row - chunk.length) * cellSize)
      scrollLeft += marginSize + (column === -1 ? chunk[0].length : column) * cellSize
      return row !== -1
    }) !== -1
  })

  return {
    scrollLeft: Math.max(0, Math.min(getMaxWidth(chunks, marginSize, cellSize, gridWidth), scrollLeft - gridWidth * 0.5)),
    scrollTop: Math.max(0, Math.min(getMaxHeight(chunks, marginSize, cellSize, gridHeight), scrollTop - gridHeight * 0.5))
  }
})

export const getScrollStep = memoizee((start: { scrollLeft: number, scrollTop: number }, end: { scrollLeft: number, scrollTop: number }, elapsed: number): { scrollLeft: number, scrollTop: number} => {
  const getVal = (start: number, end: number): number => elapsed > 500 ? end : start + (end - start) * (elapsed / 500)
  return { scrollLeft: getVal(start.scrollLeft, end.scrollLeft), scrollTop: getVal(start.scrollTop, end.scrollTop) }
})
