// @flow
import React, { useContext, useEffect, useRef, useState, useMemo } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { CSSTransition } from 'react-transition-group'
import { Grid, AutoSizer } from 'react-virtualized'
import { filterBySection, filterByFamily } from 'src/store/actions/loadColors'
import { type ColorsState, type GridRefState } from 'src/shared/types/Actions.js.flow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ColorWallContext, { type ColorWallContextProps } from './ColorWallContext'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import {
  getLevelMap,
  getScrollStep,
  getCoords,
  getLongestArrayIn2dArray,
  getWidthOfWidestChunkRowInChunkGrid,
  makeChunkGrid,
  computeFinalScrollPosition,
  getHeightOfChunkRow,
  rowHasLabels,
  calculateLabelHeight,
  calculateLabelMarginBottom,
  getTotalGridWidth,
  getTotalGridHeight
} from './ColorWallUtils'
import ColorSwatch from './ColorSwatch/ColorSwatch'
import ColorChipLocator from './ColorChipLocator/ColorChipLocator'
import { compareKebabs } from 'src/shared/helpers/StringUtils'
import clamp from 'lodash/clamp'
import flatten from 'lodash/flatten'
import isEmpty from 'lodash/isEmpty'
import kebabCase from 'lodash/kebabCase'
import noop from 'lodash/noop'
import range from 'lodash/range'
import rangeRight from 'lodash/rangeRight'
import take from 'lodash/take'
import { generateColorWallPageUrl, fullColorName } from 'src/shared/helpers/ColorUtils'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import 'src/scss/convenience/overflow-ellipsis.scss'
import './ColorWall.scss'
// polyfill to make focus-within css class work in IE
import 'focus-within-polyfill'
import minimapDict from './minimap-dict'
const WALL_HEIGHT = 475
type ColorWallProps = {
  section?: string,
  family?: string,
  colorId?: string
}
const ColorWall = ({ section: sectionOverride, family: familyOverride, colorId: colorIdOverride }: ColorWallProps) => {
  const { autoHeight, chunkClickable, chunkMiniMap, colorWallBgColor, colorWallPageRoot, isChipLocator, leftHandDisplay, swatchMaxSize: globalSwatchMaxSize, swatchMinSize, swatchSizeZoomed, inactiveColorRouteBuilderRef, activeColorRouteBuilderRef }: ColorWallContextProps = useContext(ColorWallContext)
  const { brandId, colorWall: { bloomEnabled = true, colorSwatch = {}, gapsBetweenChunks = true }, uiStyle }: ConfigurationContextType = useContext(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const dispatch: { type: string, payload: {} } => void = useDispatch()
  const { url, params: _params }: { url: string, params: { section: ?string, family?: ?string, colorId?: ?string } } = useRouteMatch()
  // NOTE:  making it possible to override integrated route-based section/family/colorId navigation based on props
  //        first step in removing the hard-coded route dependency shape. this needs to be separate so we can support different
  //        route shapes
  const params = {
    section: sectionOverride ?? _params.section,
    family: familyOverride ?? _params.family,
    colorId: colorIdOverride ?? _params.colorId
  }

  const history = useHistory()
  const { messages = {} } = useIntl()
  const { chunkGridParams, family, items: { colorMap = {}, colorStatuses = {}, sectionLabels: _sectionLabels = {} }, primeColorWall, section = '', sectionsShortLabel, unChunkedChunks }: ColorsState = useSelector(state => state.colors)
  // if a family is selected, NEVER return section labels (they're only for sections)
  const sectionLabels = useMemo(() => {
    return family ? {} : _sectionLabels
  }, [_sectionLabels, family])

  const [chunkGrid: string[][][][], setChunkGrid: (string[][][][]) => void] = useState([])
  const [containerWidth: number, setContainerWidth: (number) => void] = useState(900)
  const gridRef: GridRefState = useRef()
  const cellRefs: { current: { [string]: HTMLElement } } = useRef({})
  const focusedChunkCoords: { current: ?[number, number] } = useRef()
  const focusedCell: { current: ?string } = useRef()

  const isZoomedIn = !!params.colorId
  const lengthOfLongestChunkRow: number = getLongestArrayIn2dArray(chunkGrid)
  // when dynamic cell sizing is enabled, adjust maxCellSize to be 90% as big as when zoomed or 90% as big as it can be without showing a scrollbar, whatever is smallest
  const swatchMaxSize = chunkGridParams.dynamicCellSizingEnabled
    ? 0.9 * Math.min(
      containerWidth / getTotalGridWidth(chunkGrid, 0.4),
      WALL_HEIGHT / getTotalGridHeight(chunkGrid, 0.4, sectionLabels[section]),
      swatchSizeZoomed
    )
    : globalSwatchMaxSize

  // when chunkGrid resize is enabled
  const swatchSizeUnzoomed: number = chunkGridParams.wrappingEnabled
    ? swatchMaxSize
    : clamp(containerWidth / (getWidthOfWidestChunkRowInChunkGrid(chunkGrid) + lengthOfLongestChunkRow + 1), swatchMinSize, swatchMaxSize)

  const cellSize: number = isZoomedIn ? swatchSizeZoomed : swatchSizeUnzoomed
  const levelMap: { [string]: number } = getLevelMap(chunkGrid, bloomEnabled, params.colorId)

  const createActiveColorRoute = useRef(noop)
  const createInactiveColorRoute = useRef(noop)

  // TODO: refactor createActiveColorRoute and createInactiveColorRoute to come in as props from the implementing component
  createActiveColorRoute.current = () => {
    if (activeColorRouteBuilderRef && activeColorRouteBuilderRef.current) {
      activeColorRouteBuilderRef.current(colorMap[focusedCell.current])
    } else {
      history.push(generateColorWallPageUrl(params.section, params.family, focusedCell.current, fullColorName(colorMap[focusedCell.current])) + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : ''))
    }
  }
  createInactiveColorRoute.current = (color) => {
    if (inactiveColorRouteBuilderRef && inactiveColorRouteBuilderRef.current) {
      inactiveColorRouteBuilderRef.current(color)
    } else {
      history.push(generateColorWallPageUrl(section, family))
    }
  }

  // keeps redux store and url in sync for family and section data
  useEffect(() => {
    if (params.section) {
      setChunkGrid([])
      dispatch(filterBySection(params.section))
    }
  },
  [compareKebabs(params.section, section)])
  useEffect(() => { dispatch(filterByFamily(params.family)) }, [compareKebabs(params.family, family)])

  // build the chunkGrid based on color wall container width
  useEffect(() => {
    if (!isEmpty(unChunkedChunks) && !isEmpty(chunkGridParams)) {
      setChunkGrid(makeChunkGrid(unChunkedChunks, chunkGridParams, Math.ceil(containerWidth / swatchSizeUnzoomed), !!params.family))
    }
  }, [unChunkedChunks, chunkGridParams, containerWidth])

  // initialize a keypress listener
  useEffect(() => {
    const handleKeyDown = e => {
      if (!focusedChunkCoords.current) { return }
      // prevent default behavior for arrow keys
      if (e.keyCode >= 37 && e.keyCode <= 40) { e.preventDefault() }

      const [row: number, column: number] = focusedChunkCoords.current
      const chunk = chunkGrid[row][column]
      const [cellRow: number, cellColumn: number] = getCoords(chunk, focusedCell.current)

      ;({
        '9': () => {
          // use default tab behavior when focused on bloomed cell
          if (params.colorId && document.activeElement === cellRefs.current[params.colorId] && !e.shiftKey) { return }

          const nextCoords = (e.shiftKey
            // generate coordinate pairs [[row, col], ...] starting from currently focused chunk going top -> bottom, right -> left
            ? rangeRight(column + 1).flatMap(c => rangeRight(c === column ? row + 1 : chunkGrid.length).map(r => [r, c]))
            // generate coordinate pairs [[row, col], ...] starting from currently focused chunk going bottom -> top, left -> right
            : range(column, lengthOfLongestChunkRow).flatMap(c => range(c === column ? row + 1 : 0, chunkGrid.length).map(r => [r, c]))
          // find the first chunk that isn't the currently focused chunk and exists in the chunkGrid
          ).find(([r, c]) => !(r === row && c === column) && chunkGrid[r] && chunkGrid[r][c])

          if (nextCoords !== undefined) {
            e.preventDefault()
            gridRef.current && gridRef.current.scrollToCell({ rowIndex: nextCoords[0], columnIndex: nextCoords[1] })
            const nextChunk: string[][] = chunkGrid[nextCoords[0]][nextCoords[1]]
            // if bloomed cell exists in newly focused chunk, focus on that. Otherwise focuse on top left cell
            cellRefs.current[params.colorId && getCoords(nextChunk, params.colorId)[0] !== -1 ? params.colorId : nextChunk[0][0]].focus()
          } else {
            (e.shiftKey
              // when pressing shift tab on the first chunk, first set focus to first cell so that the default action will set focus to the element immediately before the color wall
              ? cellRefs.current[chunk[0][0]]
              // when pressing tab on the last chunk, first set focus to last cell so that the default action will set focus to the first element after the color wall
              : cellRefs.current[chunk[chunk.length - 1][chunk[chunk.length - 1].length - 1]]
            ).focus()

            focusedChunkCoords.current = null
            focusedCell.current = null
          }
        },
        '13': () => {
          // directly modifing params.colorId instead of calling history.push will make the react-test-renderer not run the useEffect that depends on params.colorId
          focusedCell.current && createActiveColorRoute.current()
        },
        '27': () => {
          focusedCell.current && createInactiveColorRoute.current(colorMap[focusedCell.current])
        },
        '37': () => { cellColumn > 0 && cellRefs.current[chunk[cellRow][cellColumn - 1]].focus() },
        '38': () => { cellRow > 0 && cellRefs.current[chunk[cellRow - 1][cellColumn]].focus() },
        '39': () => { cellColumn < chunk[cellRow].length - 1 && cellRefs.current[chunk[cellRow][cellColumn + 1]].focus() },
        '40': () => { cellRow < chunk.length - 1 && cellRefs.current[chunk[cellRow + 1][cellColumn]].focus() }
      }[e.keyCode] || (() => {}))()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [chunkGrid])

  // reset refs when the chunkGrid changes
  useEffect(() => {
    cellRefs.current = {}
    focusedChunkCoords.current = null
    focusedCell.current = null
  }, [chunkGrid])

  // recalculate gridSize/cellSize when zooming in/out, changing the chunkGrid, or changing grid width
  useEffect(() => {
    gridRef.current && gridRef.current.recomputeGridSize()
    // forces the scroll position to reset after zooming out (for some reason the scroll position is not updated in firefox)
    gridRef.current && !isZoomedIn && gridRef.current.scrollToPosition({ scrollLeft: 0, scrollTop: 0 })
  }, [isZoomedIn, containerWidth, chunkGrid])

  // start scrolling animation when scroll position changes due to new active color or containerWidth changing
  useEffect(() => {
    if (!params.colorId || !gridRef.current || !chunkGrid || chunkGrid.length === 0) { return }

    // set focus on bloomed swatch
    cellRefs.current[params.colorId] && cellRefs.current[params.colorId].focus()

    const startTime: number = window.performance.now()
    const end = computeFinalScrollPosition(chunkGrid, params.colorId, containerWidth, WALL_HEIGHT, sectionLabels[section], gapsBetweenChunks ? 0.4 : 0)

    ;(function scroll () {
      window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
        if (!gridRef.current) return

        gridRef.current.scrollToPosition(getScrollStep(gridRef.current.state, end, timestamp - startTime))

        if (gridRef.current?.state.scrollLeft !== end.scrollLeft || gridRef.current?.state.scrollTop !== end.scrollTop) {
          scroll()
        }
      })
    })()
  }, [params.colorId, containerWidth, chunkGrid])

  const chunkRenderer = ({ rowIndex: chunkRow, columnIndex: chunkColumn, key, style }) => {
    const chunk: string[][] = chunkGrid[chunkRow][chunkColumn]
    const chunkNum: number = take(chunkGrid, chunkRow).reduce((num, chunkRow) => num + chunkRow.length, 0) + chunkColumn
    const lengthOfLongestRow: number = getLongestArrayIn2dArray(chunk)
    const containsBloomedCell: boolean = getCoords(chunk, params.colorId)[0] !== -1
    const isLargeLabel: boolean = cellSize * lengthOfLongestRow > 255 // magic number breakpoint for choosing between small and large font
    const chunkClickableProps = chunkClickable && params.section === kebabCase(primeColorWall) ? {
      onClick: () => {
        window.location.href = colorWallPageRoot?.(sectionLabels[section][chunkNum] || '')
        GA.event({ category: 'Color Wall', action: 'Color Family', label: sectionLabels[section][chunkNum] }, GA_TRACKER_NAME_BRAND[brandId])
      },
      role: 'button',
      tabIndex: 0
    } : null

    return (flatten(chunk).some(cell => cell !== undefined) &&
      <div
        key={key}
        className='color-wall-chunk'
        style={{ ...style, padding: gapsBetweenChunks && !chunkMiniMap ? cellSize / 5 : 0, zIndex: containsBloomedCell ? 1 : 'auto' }}
        {...chunkClickableProps}
      >
        {sectionLabels[section] && sectionLabels[section][chunkNum] !== undefined && !chunkClickableProps && !chunkMiniMap && (
          <div
            className='color-wall-section-label'
            style={{
              width: style.width - cellSize * 0.4,
              height: calculateLabelHeight(cellSize),
              marginBottom: calculateLabelMarginBottom(isZoomedIn, cellSize)
            }}
          >
            <div
              className={`color-wall-section-label__text ${isLargeLabel ? 'color-wall-section-label__text--large' : ''}`}
              style={{ justifyContent: uiStyle === 'minimal' ? 'left' : 'center' }}
            >
              {sectionLabels[section][chunkNum]}
            </div>
          </div>
        )}
        <Grid
          role='presentation'
          tabIndex={-1}
          className='inner-grid'
          style={houseShaped ? { marginTop: '1rem' } : {}}
          cellRenderer={({ rowIndex, columnIndex, key, style }) => {
            const colorId: string = chunk[rowIndex][columnIndex]
            const color = colorId && colorMap[colorId]

            return color && (
              <ColorSwatch
                ref={ref => { cellRefs.current[colorId] = ref }}
                onFocus={() => {
                  focusedCell.current = colorId
                  focusedChunkCoords.current = [chunkRow, chunkColumn]
                }}
                key={key}
                style={style}
                color={color}
                contentRenderer={(defaultContent) => isChipLocator ? (
                  <div className='color-swatch__chip-locator'>
                    {defaultContent[0]}
                    <div className='color-swatch__chip-locator__location'>
                      <p className='color-swatch__chip-locator__name'>Location</p>
                      <p className='color-swatch__chip-locator__col-row'>Col: {color.column}&nbsp;&nbsp;Row: {color.row}</p>
                    </div>
                  </div>
                ) : houseShaped ? (
                  <>
                    <div className='color-swatch-house-shaped__btns'>{defaultContent[1]}</div>
                    <div className='color-swatch-house-shaped__label'>{defaultContent[0]}</div>
                  </>
                ) : <>{defaultContent}</>}
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

  const selectedColor = colorMap[params.colorId || '']

  return (
    <CSSTransition in={isZoomedIn} timeout={200}>
      <div className='color-wall'>
        {chunkMiniMap && sectionOverride && (
          <div className='color-wall-section-label__minimap'>
            {(sectionsShortLabel && sectionsShortLabel[sectionOverride]) ?? sectionLabels[sectionOverride]}
            <div className='color-wall-section-label__minimap--image' style={{ backgroundImage: `url(${minimapDict[`${brandId}${leftHandDisplay ? 'LeftHand' : ''}`][sectionOverride]})` }} />
          </div>
        )}
        {params.colorId && (
          <button onClick={() => createInactiveColorRoute.current(selectedColor)} className='zoom-out-btn' style={{ top: chunkMiniMap ? '3.8rem' : 0 }} title={messages.ZOOM_OUT}>
            <FontAwesomeIcon icon='search-minus' size='lg' />
          </button>
        )}
        <AutoSizer disableHeight onResize={({ width }) => setContainerWidth(width)}>
          {({ height = WALL_HEIGHT, width = 900 }) => (
            <Grid
              role='presentation'
              tabIndex={-1}
              ref={gridRef}
              className='outer-grid'
              style={{ backgroundColor: colorWallBgColor, padding: cellSize, ...(autoHeight ? { height: 'auto' } : null) }}
              cellRenderer={chunkRenderer}
              height={height}
              width={width}
              rowCount={chunkGrid ? chunkGrid.length : 0}
              rowHeight={({ index }): number => {
                const hasLabel: boolean = sectionLabels && rowHasLabels(chunkGrid, index, sectionLabels[section]) && !chunkMiniMap
                return ((getHeightOfChunkRow(chunkGrid[index]) + (gapsBetweenChunks ? 0.4 : 0)) * cellSize) + (hasLabel ? cellSize + (isZoomedIn ? 30 : 10) : 0)
              }}
              columnCount={lengthOfLongestChunkRow}
              columnWidth={({ index }) => {
                const chunkColumn: string[][][] = chunkGrid.map(chunkRow => chunkRow[index])
                return cellSize * chunkColumn.reduce((w, chunk) => Math.max(w, getLongestArrayIn2dArray(chunk) + (gapsBetweenChunks ? 0.4 : 0)), 0)
              }}
            />
          )}
        </AutoSizer>
        {isChipLocator && kebabCase(params.section) === kebabCase(sectionOverride) && selectedColor ? <ColorChipLocator color={selectedColor} /> : null}
      </div>
    </CSSTransition>
  )
}

export default ColorWall
