// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useHistory, useRouteMatch, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { CSSTransition } from 'react-transition-group'
import { Grid, AutoSizer } from 'react-virtualized'
import { filterBySection, filterByFamily } from 'src/store/actions/loadColors'
import { type ColorsState, type GridRefState } from 'src/shared/types/Actions.js.flow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ColorWallContext from './ColorWallContext'
import type { ColorWallContextProps } from './ColorWallContext'
import { getLevelMap, getScrollPosition, getScrollStep, findIndexIn2dArray, convertToChunkArray, getWidthOf2dArray, getWidthOf3dArray, getWidthOf4dArray } from './ColorWallUtils'
import ColorSwatch from './ColorSwatch/ColorSwatch'
import { compareKebabs } from 'src/shared/helpers/StringUtils'
import range from 'lodash/range'
import rangeRight from 'lodash/rangeRight'
import flatten from 'lodash/flatten'
import { generateColorWallPageUrl, fullColorName } from 'src/shared/helpers/ColorUtils'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import 'src/scss/convenience/overflow-ellipsis.scss'
import './ColorWall.scss'
// polyfill to make focus-within css class work in IE
import 'focus-within-polyfill'

const WALL_HEIGHT = 475

const ColorWall = () => {
  const dispatch: ({ type: string, payload: {} }) => void = useDispatch()
  const { url, params }: { url: string, params: { section: ?string, family?: ?string, colorId?: ?string } } = useRouteMatch()
  const history = useHistory()
  const { items: { colorMap = {}, colorStatuses = {}, sectionLabels = {} }, layout, section, family }: ColorsState = useSelector(state => state.colors)
  const { swatchMinSize, swatchMaxSize, swatchMaxSizeZoomed, colorWallBgColor }: ColorWallContextProps = useContext(ColorWallContext)
  const { messages = {} } = useIntl()

  const gridRef: GridRefState = useRef()
  const cellRefs: { current: { [string]: HTMLElement } } = useRef({})
  const focusedChunkCoords: { current: ?[number, number] } = useRef()
  const focusedCell: { current: ?string } = useRef()

  const [gridWidth: number, setGridWidth: (number) => void] = useState(900)

  const chunkGrid: string[][][][] = layout ? convertToChunkArray(layout) : []
  const levelMap: { [string]: number } = getLevelMap(chunkGrid, params.colorId)
  const lengthOfLongestChunkRow: number = getWidthOf2dArray(chunkGrid)
  const isZoomedIn = !!params.colorId
  const cellSize: number = isZoomedIn ? swatchMaxSizeZoomed : Math.max(Math.min(gridWidth / (getWidthOf4dArray(chunkGrid) + lengthOfLongestChunkRow + 1), swatchMaxSize), swatchMinSize)

  // keeps redux store and url in sync for family and section data
  useEffect(() => { params.section && dispatch(filterBySection(params.section)) }, [compareKebabs(params.section, section)])
  useEffect(() => { dispatch(filterByFamily(params.family)) }, [compareKebabs(params.family, family)])

  // initialize a keypress listener
  useEffect(() => {
    const handleKeyDown = e => {
      if (!focusedChunkCoords.current) { return }
      if (e.keyCode >= 37 && e.keyCode <= 40) { e.preventDefault() }

      const [row: number, column: number] = focusedChunkCoords.current
      const chunk = chunkGrid[row][column]
      const [cellRow: number, cellColumn: number] = findIndexIn2dArray(focusedCell.current, chunk)

      ;({
        '9': () => {
          // use default tab behavior when focused on bloomed cell
          if (params.colorId && document.activeElement === cellRefs.current[params.colorId] && !e.shiftKey) { return }

          const nextCoords = (e.shiftKey
            ? rangeRight(column + 1).flatMap((c: number) => rangeRight(0, c === column ? row : chunkGrid.length).map(r => [r, c]))
            : range(column, chunkGrid[row].length).flatMap((c: number) => range(c === column ? row + 1 : 0, chunkGrid.length).map(r => [r, c]))
          ).find(([r, c]) => flatten(chunkGrid[r][c]).some(cell => cell !== undefined))

          if (nextCoords !== undefined) {
            e.preventDefault()
            gridRef.current && gridRef.current.scrollToCell({ rowIndex: nextCoords[0], columnIndex: nextCoords[1] })
            const nextChunk: string[][] = chunkGrid[nextCoords[0]][nextCoords[1]]
            // if bloomed cell exists in newly focused chunk, focus on that. Otherwise focuse on top left cell
            cellRefs.current[params.colorId && findIndexIn2dArray(params.colorId, nextChunk)[0] !== -1 ? params.colorId : nextChunk[0][0]].focus()
          } else {
            focusedChunkCoords.current = null
            focusedCell.current = null
          }
        },
        '13': () => {
          // directly modifing params.colorId instead of calling history.push will make the react-test-renderer not run the useEffect that depends on params.colorId
          focusedCell.current && history.push(generateColorWallPageUrl(params.section, params.family, focusedCell.current, fullColorName(colorMap[focusedCell.current])) + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : ''))
        },
        '27': () => { focusedCell.current && history.push(generateColorWallPageUrl(section, family)) },
        '37': () => { cellColumn > 0 && cellRefs.current[chunk[cellRow][cellColumn - 1]].focus() },
        '38': () => { cellRow > 0 && cellRefs.current[chunk[cellRow - 1][cellColumn]].focus() },
        '39': () => { cellColumn < chunk[cellRow].length - 1 && cellRefs.current[chunk[cellRow][cellColumn + 1]].focus() },
        '40': () => { cellRow < chunk.length - 1 && cellRefs.current[chunk[cellRow + 1][cellColumn]].focus() }
      }[e.keyCode] || (() => {}))()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [layout])

  // reset refs when the layout changes
  useEffect(() => {
    cellRefs.current = {}
    focusedChunkCoords.current = null
    focusedCell.current = null
  }, [layout])

  // recalculate gridSize/cellSize when zooming in/out, chainging the layout, or changing grid width
  useEffect(() => {
    gridRef.current && gridRef.current.recomputeGridSize()
    // forces the scroll position to reset after zooming out (for some reason the scroll position is not updated in firefox)
    gridRef.current && !isZoomedIn && gridRef.current.scrollToPosition({ scrollLeft: 0, scrollTop: 0 })
  }, [isZoomedIn, gridWidth, layout])

  // start scrolling animation when scroll position changes due to new active color or gridWidth changing
  useEffect(() => {
    if (!params.colorId || !gridRef.current || !layout) { return }

    // set focus on bloomed swatch
    cellRefs.current[params.colorId] && cellRefs.current[params.colorId].focus()

    const startTime: number = window.performance.now()
    const end = getScrollPosition(params.colorId, chunkGrid, cellSize * 0.4, cellSize, gridWidth, WALL_HEIGHT)

    ;(function scroll () {
      window.requestAnimationFrame(() => {
        gridRef.current && gridRef.current.scrollToPosition(getScrollStep(gridRef.current.state, end, window.performance.now() - startTime))
        gridRef.current && (gridRef.current.state.scrollLeft !== end.scrollLeft || gridRef.current.state.scrollTop !== end.scrollTop) && scroll()
      })
    })()
  }, [params.colorId, gridWidth])

  const chunkRenderer = ({ rowIndex: chunkRow, columnIndex: chunkColumn, key, style }) => {
    const chunk: string[][] = chunkGrid[chunkRow][chunkColumn]
    const lengthOfLongestRow: number = getWidthOf2dArray(chunk)
    const containsBloomedCell = findIndexIn2dArray(params.colorId, chunk)[0] !== -1
    const labelHeight = Math.max(1.2 * cellSize, 40)
    const chunkWidth = cellSize * lengthOfLongestRow
    const isLargeLabel = chunkWidth > 120 // magic number breakpoint for choosing between small and large font
    const labelTopOffset = isZoomedIn ? -(labelHeight * 1.75) : -labelHeight

    return (flatten(chunk).some(cell => cell !== undefined) &&
      <div key={key} className='color-wall-chunk' style={{ ...style, padding: cellSize * 0.2, zIndex: containsBloomedCell ? 1 : 'auto' }}>
        {chunkRow === 0 && sectionLabels[section] && (
          <div className='color-wall-section-label' style={{ width: style.width - cellSize * 0.4, height: labelHeight, top: labelTopOffset }}>
            <div className={`color-wall-section-label__text ${isLargeLabel ? 'color-wall-section-label__text--large' : ''}`}>
              {sectionLabels[section][chunkColumn]}
            </div>
          </div>
        )}
        <Grid
          role='presentation'
          tabIndex={-1}
          className='inner-grid'
          cellRenderer={({ rowIndex, columnIndex, key, style }) => {
            const colorId: string = chunk[rowIndex][columnIndex]
            return (
              <ColorSwatch
                ref={ref => { cellRefs.current[colorId] = ref }}
                onFocus={() => {
                  focusedCell.current = colorId
                  focusedChunkCoords.current = [chunkRow, chunkColumn]
                }}
                key={key}
                style={style}
                color={colorMap[colorId]}
                level={levelMap[colorId]}
                status={colorStatuses[colorId]}
              />
            )
          }}
          width={(lengthOfLongestRow * cellSize)}
          height={chunk.length * cellSize}
          rowCount={chunk.length}
          rowHeight={cellSize}
          columnCount={lengthOfLongestRow}
          columnWidth={cellSize}
        />
      </div>
    )
  }

  return (
    <CSSTransition in={isZoomedIn} timeout={200}>
      <div className='color-wall'>
        {params.colorId && (
          <Link to={generateColorWallPageUrl(section, family)} className='zoom-out-btn' title={messages.ZOOM_OUT}>
            <FontAwesomeIcon icon='search-minus' size='lg' />
          </Link>
        )}
        <AutoSizer disableHeight onResize={({ width }) => setGridWidth(width)}>
          {({ height = WALL_HEIGHT, width = 900 }) => (
            <Grid
              role='presentation'
              tabIndex={-1}
              ref={gridRef}
              style={{
                backgroundColor: colorWallBgColor,
                padding: cellSize,
                paddingTop: sectionLabels[section] ? 2 * cellSize : cellSize
              }}
              cellRenderer={chunkRenderer}
              height={height + (sectionLabels[section] ? cellSize : 0)}
              width={width}
              rowCount={chunkGrid.length}
              rowHeight={({ index }): number => (getWidthOf2dArray(chunkGrid[index]) * cellSize) + (cellSize * 0.4)}
              columnCount={lengthOfLongestChunkRow}
              columnWidth={({ index }): number => (getWidthOf3dArray(chunkGrid.map(chunkRow => chunkRow[index])) * cellSize) + (cellSize * 0.4)}
            />
          )}
        </AutoSizer>
      </div>
    </CSSTransition>
  )
}

export default ColorWall
