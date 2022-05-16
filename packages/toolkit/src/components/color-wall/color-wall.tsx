import React, { useState, useEffect, useRef } from 'react'
import { Grid, AutoSizer } from 'react-virtualized'
import { clamp, fill, range, isEmpty } from 'lodash'
import { Color } from '../../types'
import {
  ScrollPosition,
  getLongestArrayIn2dArray,
  getWidthOfWidestChunkRowInChunkGrid,
  getHeightOfChunkRow,
  makeChunkGrid,
  computeFinalScrollPosition,
  getScrollStep,
  getCoords
} from './utils'

export interface ColorWallProps {
  chunkHeight?: number
  chunkWidth?: number
  gridWidth?: number
  swatchSize?: { MIN: number; MAX: number; ZOOMED: number }
  wrappingEnabled?: boolean
  colors: Color[][]
  swatchRenderer: (swatch: { active: boolean, color: Color; style: {}; onClick: () => void; key: number | string }) => JSX.Element
  zoomOutButtonRenderer: (callbacK: () => void) => JSX.Element
}

const ColorWall = ({
  chunkHeight,
  chunkWidth,
  gridWidth,
  swatchSize = { MIN: 12, MAX: 20, ZOOMED: 50 },
  wrappingEnabled = true,
  colors,
  swatchRenderer,
  zoomOutButtonRenderer
}: ColorWallProps): JSX.Element => {
  const gridRef: {
    current?: { state: ScrollPosition; scrollToPosition: (ScrollPosition) => void }
  } = useRef()
  const [containerWidth, setContainerWidth] = useState<number>(900)
  const [chunkGrid, setChunkGrid] = useState<Color[][][][]>([])
  const [activeColor, setActiveColor] = useState<Color>()

  const lengthOfLongestRow = getLongestArrayIn2dArray(chunkGrid)
  const unzoomedSwatchSize = wrappingEnabled
    ? swatchSize.MAX
    : clamp(
        containerWidth / (getWidthOfWidestChunkRowInChunkGrid(chunkGrid) + lengthOfLongestRow + 1),
        swatchSize.MIN,
        swatchSize.MAX
      )
  const cellSize = activeColor === undefined ? unzoomedSwatchSize : swatchSize.ZOOMED

  useEffect(() => {
    if (!isEmpty(colors) && !isEmpty({ gridWidth, chunkWidth, chunkHeight, wrappingEnabled })) {
      const w = Math.ceil(containerWidth / unzoomedSwatchSize)
      setChunkGrid(makeChunkGrid(colors, { gridWidth, chunkWidth, chunkHeight, wrappingEnabled }, w))
    }
  }, [colors, containerWidth, gridWidth, chunkWidth, chunkHeight, wrappingEnabled])

  useEffect(() => {
    // start scrolling animation when scroll position changes due to new active color or width changing
    if (!activeColor || !gridRef.current || !chunkGrid || chunkGrid.length === 0) {
      return
    }

    const startTime = window.performance.now()
    const end = computeFinalScrollPosition(chunkGrid, activeColor, containerWidth, 475, 0.4)

    function scroll(): void {
      window.requestAnimationFrame((timestamp) => {
        gridRef.current?.scrollToPosition(getScrollStep(gridRef.current.state, end, timestamp - startTime))
        if (
          gridRef.current?.state.scrollLeft !== end.scrollLeft ||
          gridRef.current?.state.scrollTop !== end.scrollTop
        ) {
          scroll()
        }
      })
    }
    scroll()
  }, [activeColor, containerWidth])

  if (chunkGrid.length === 0) return <p>loading</p>

  return (
    <>
      {activeColor && zoomOutButtonRenderer(() => setActiveColor(undefined))}
      <AutoSizer disableHeight onResize={({ width }) => setContainerWidth(width)}>
        {({ height = 475, width = 900 }) => (
          <Grid
            // @ts-ignore
            ref={gridRef}
            className='bg-gray-100 animate-fadeIn'
            style={{ padding: cellSize, width }}
            containerStyle={{ overflow: 'visible' }}
            key={cellSize}
            cellRenderer={({ rowIndex, columnIndex, key, style }) => {
              const chunk = chunkGrid[rowIndex][columnIndex]
              if (!chunk) {
                return
              }
              const lengthOfLongestRow = getLongestArrayIn2dArray(chunk)
              const styles = range(chunk.length).map((row) =>
                fill(Array(chunk[row].length), { zIndex: 0, transform: 'scale(1)' })
              )
              const [row, col] = getCoords(chunk, activeColor)
              if (row !== -1) {
                styles[row][col] = { zIndex: 40, transform: 'scale(2.75)' }

                const setStyles = (indexes, style): any =>
                  indexes.forEach(([row, col]): any => styles[row]?.[col] && (styles[row][col] = style))
                // close above/below/left/right
                setStyles(
                  [
                    [row + 1, col],
                    [row - 1, col],
                    [row, col + 1],
                    [row, col - 1]
                  ],
                  { zIndex: 35, transform: 'scale(2.36)' }
                )
                // close diagonals
                setStyles(
                  [
                    [row + 1, col + 1],
                    [row + 1, col - 1],
                    [row - 1, col + 1],
                    [row - 1, col - 1]
                  ],
                  { zIndex: 30, transform: 'scale(2.08)' }
                )
                // far above/below/left/right
                setStyles(
                  [
                    [row + 2, col],
                    [row - 2, col],
                    [row, col + 2],
                    [row, col - 2]
                  ],
                  { zIndex: 25, transform: 'scale(1.74)' }
                )
                // far diagonals
                setStyles(
                  [
                    [row + 2, col + 1],
                    [row + 2, col - 1],
                    [row - 2, col + 1],
                    [row - 2, col - 1],
                    [row + 1, col + 2],
                    [row - 1, col + 2],
                    [row - 1, col - 2]
                  ],
                  { zIndex: 20, transform: 'scale(1.41)' }
                )
              }

              return (
                <div key={key} style={{ ...style }}>
                  <Grid
                    style={{ overflow: 'visible', zIndex: row !== -1 ? '5' : '0' }}
                    containerStyle={{ overflow: 'visible' }}
                    cellRenderer={({ rowIndex, columnIndex, key, style }) => {
                      const color = chunk[rowIndex][columnIndex]
                      return (
                        color !== undefined &&
                        swatchRenderer({
                          active: color.id === activeColor?.id,
                          color,
                          style: { ...style, ...styles[rowIndex][columnIndex] },
                          onClick: () => setActiveColor(color),
                          key
                        })
                      )
                    }}
                    width={lengthOfLongestRow * cellSize}
                    height={chunk.length * cellSize}
                    rowCount={chunk.length}
                    rowHeight={cellSize}
                    columnCount={lengthOfLongestRow}
                    columnWidth={cellSize}
                  />
                </div>
              )
            }}
            width={width}
            height={height}
            rowCount={chunkGrid.length}
            rowHeight={({ index }) => (getHeightOfChunkRow(chunkGrid[index]) + 0.4) * cellSize}
            columnCount={lengthOfLongestRow}
            columnWidth={({ index }) => {
              const chunkColumn = chunkGrid.map((chunkRow) => chunkRow[index])
              return cellSize * chunkColumn.reduce((w, chunk) => Math.max(w, getLongestArrayIn2dArray(chunk) + 0.4), 0)
            }}
          />
        )}
      </AutoSizer>
    </>
  )
}

export default ColorWall
