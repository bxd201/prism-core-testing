// @flow
import React, { PureComponent } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import at from 'lodash/at'
import isFunction from 'lodash/isFunction'
import clone from 'lodash/clone'
import * as scroll from 'scroll'
import { withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import memoizee from 'memoizee'

import { varValues } from 'src/shared/variableDefs'
import ColorWallSwatch from './ColorWallSwatch/ColorWallSwatch'
import ColorWallSwatchUI from './ColorWallSwatch/ColorWallSwatchUI'
import ColorWallSwatchRenderer from './ColorWallSwatch/ColorWallSwatchRenderer'
import ChunkBoundary from './ChunkBoundary'
import { type ColorMap, type Color, type ProbablyColorId, type ColorIdGrid, type ColorStatuses, type ColorStatus } from '../../../shared/types/Colors.js.flow'
import { getColorCoords, drawCircle, getCoordsObjectFromPairs, findContainingChunk, findChunkFromCorner, overscanIndicesGetter } from './ColorWallUtils'
import { getTotalWidthOf2dArray } from '../../../shared/helpers/DataUtils'
import { fullColorName } from '../../../shared/helpers/ColorUtils'
import { type GridBounds, type ColorReference } from './ColorWall.flow'
import { type ColorWallContextProps, type ColorWallA11yContextProps } from './ColorWallContext'
import withColorWallContext from './withColorWallContext'
import { IS_IE } from 'src/constants/globals'
import WithLiveAnnouncerContext from 'src/contexts/LiveAnnouncerContext/WithLiveAnnouncerContext'
import { type LiveAnnouncerProps } from 'src/contexts/LiveAnnouncerContext/LiveAnnouncerContextProvider'

import 'src/scss/externalComponentSupport/AutoSizer.scss'
import 'src/scss/convenience/overflow-ellipsis.scss'
import './ColorWallSwatchList.scss'

// controls the duration of the grid's autoscroll when centering on an active swatch
const GRID_AUTOSCROLL_SPEED: number = 300
// this is used to adjust how much smaller the between-chunk cells are in relation to populated cells
const COLLAPSED_CELL_SIZE_RATIO: number = 0.4

// ----------------------------------------
// PROP TYPES
type IntlProps = {
  intl: { formatMessage: Function }
}

type RouterProps = { location: any, history: any }

type ReduxProps = { sectionLabels: any }

type Props = IntlProps & RouterProps & ReduxProps & {
  activeColor?: Color, // eslint-disable-line react/no-unused-prop-types
  bloomRadius: number,
  colorMap: ColorMap,
  colors: ColorIdGrid, // eslint-disable-line react/no-unused-prop-types
  colorStatuses?: ColorStatuses,
  colorWallContext: ColorWallContextProps & ColorWallA11yContextProps,
  contain: boolean,
  family: string | void,
  immediateSelectionOnActivation?: boolean,
  liveAnnouncerContext: LiveAnnouncerProps,
  maxCellSize: number,
  minCellSize: number,
  onActivateColor?: Function,
  onAddColor?: Function,
  section: string | void,
  showAll?: boolean,
  swatchLinkGenerator: Function,
  zoomOutUrl: string,
  sectionLabels: {}
}

// END PROP TYPES
// ----------------------------------------

// ----------------------------------------
// STATE TYPES

type DerivedStateFromProps = {
  activeColorCoords: number[],
  emptyRows: string[],
  emptyColumns: string[],
  focusCoords: number[],
  levelMap: {
    [ key: string ]: ColorReference
  },
  needsInitialFocus: boolean
}

type State = DerivedStateFromProps & {
  a11yFocusChunk: GridBounds,
  a11yFocusCell: number[] | void
}

// END STATE TYPES
// ----------------------------------------

class ColorWallSwatchList extends PureComponent<Props, State> {
  _gridWrapperRef: ?RefObject = void (0)
  _swatchRefs: {
    // This will wind up being one of the ColorWallSwatch components
    [key: string]: ?RefObject
  }
  _scrollTimeout = void (0)
  // contains references to active scrolls so we can canel them if need be
  _scrollInstances = []
  // internal tracking of current grid size
  _gridWidth: number = 0
  _gridHeight: number = 0
  // internal tracking of current cell size, varying between min and maxCellSize props
  _cellSize: number
  // internal flag to check if the last user input before focusing the grid was a keypress (true) or click (false)
  _recentKeypress: boolean = false

  state: State = {
    a11yFocusCell: void (0),
    a11yFocusChunk: void (0),
    activeColorCoords: [],
    emptyColumns: [],
    emptyRows: [],
    focusCoords: [],
    levelMap: {},
    needsInitialFocus: true
  }

  static defaultProps = {
    bloomRadius: 0,
    minCellSize: 50,
    maxCellSize: 50,
    contain: true
  }

  constructor (props: Props) {
    super(props)

    this.addColor = this.addColor.bind(this)
    this.generateMakeSwatchRef = this.generateMakeSwatchRef.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
    this.handleGridKeyDown = this.handleGridKeyDown.bind(this)
    this.handleGridResize = this.handleGridResize.bind(this)
    this.handleGridFocus = this.handleGridFocus.bind(this)
    this.handleGridBlur = this.handleGridBlur.bind(this)
    this.handleBodyMouseDown = this.handleBodyMouseDown.bind(this)
    this.handleBodyKeyDown = this.handleBodyKeyDown.bind(this)
    this.handleBodyTouchStart = this.handleBodyTouchStart.bind(this)
    this.returnFocusToThisComponent = this.returnFocusToThisComponent.bind(this)
    this._gridWrapperRef = React.createRef()
    this._swatchRefs = {}
  }

  getColumnWidth = memoizee((emptyColumns, size) => {
    const collapsedSize = Math.round(size * COLLAPSED_CELL_SIZE_RATIO)

    return ({ index }) => {
      if (emptyColumns.indexOf(index) >= 0) {
        return collapsedSize
      }

      return size
    }
  })

  getRowHeight = memoizee((emptyRows, size) => {
    const collapsedSize = Math.round(size * COLLAPSED_CELL_SIZE_RATIO)

    return ({ index }) => {
      if (emptyRows.indexOf(index) >= 0) {
        return collapsedSize
      }

      return size
    }
  })

  // -----------------------------------------------
  // LIFECYCLE METHODS

  render () {
    const { minCellSize, maxCellSize, showAll, activeColor, colors, contain, colorWallContext: { a11yFocusChunk, a11yFocusCell, a11yFocusOutline }, colorStatuses } = this.props
    const { emptyRows, emptyColumns, focusCoords, needsInitialFocus } = this.state
    const colorIdGrid = colors
    const rowCount = colorIdGrid.length
    const columnCount = getTotalWidthOf2dArray(colorIdGrid)

    let addlGridProps = {}

    if (focusCoords && focusCoords.length && needsInitialFocus) {
      addlGridProps.scrollToColumn = focusCoords[0]
      addlGridProps.scrollToRow = focusCoords[1]
    }

    // if our focus outlines can be shown and we have a value for our a11y focus cell...
    if (a11yFocusOutline && a11yFocusCell && a11yFocusCell.length) {
      // ... set scrollToColumn/Row props for grid to a11yFocusCell
      addlGridProps = { ...addlGridProps, scrollToColumn: a11yFocusCell[0], scrollToRow: a11yFocusCell[1] }
    }

    return (
      <>
        <section
          className={`color-wall-swatch-list ${contain ? 'color-wall-swatch-list--contain' : ''}`}
          role='application'
          tabIndex={0} // eslint-disable-line
          ref={this._gridWrapperRef}
        >
          <AutoSizer onResize={this.handleGridResize} disableHeight={!contain}>
            {({ height = 0, width = 0 }) => {
              let size = maxCellSize

              if (width === 0 || height === 0) {
                return null
              }

              if (showAll) {
                size = Math.max(Math.min(width / columnCount, maxCellSize), minCellSize)
              }

              const emptyRowOffset = emptyRows.length * size * (1 - COLLAPSED_CELL_SIZE_RATIO)
              const gridHeight = contain ? height : Math.max(height, rowCount * size - emptyRowOffset)

              // keep tabs on our current size since it can very between min/maxCellSize
              this._cellSize = size

              return (
                <Grid
                  _forceRenderProp={activeColor}
                  _forceRenderProp2={a11yFocusChunk}
                  _forceRenderProp3={a11yFocusCell}
                  _forceRenderProp4={showAll}
                  _forceRenderProp5={colorIdGrid}
                  _forceRenderProp6={a11yFocusOutline}
                  _forceRenderProp7={colorStatuses}
                  scrollToAlignment='center'
                  cellRenderer={this.cellRenderer}
                  columnWidth={this.getColumnWidth(emptyColumns, size)}
                  estimatedColumnSize={size}
                  columnCount={columnCount}
                  overscanColumnCount={6}
                  overscanRowCount={6}
                  rowHeight={this.getRowHeight(emptyRows, size)}
                  estimatedRowHeight={size}
                  rowCount={rowCount}
                  width={width || 900}
                  height={gridHeight || 400}
                  overscanIndicesGetter={overscanIndicesGetter}
                  containerRole='presentation'
                  role='presentation'
                  tabIndex={-1}
                  {...addlGridProps}
                />
              )
            }}
          </AutoSizer>
        </section>
      </>
    )
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    const { bloomRadius, activeColor, colors } = props
    const { focusCoords } = state

    let stateChanges = state

    if (colors) {
      const rowCount = colors.length
      const columnCount = getTotalWidthOf2dArray(colors)

      const emptyRows = colors.map((row, y) => {
        if (y > 0 && y < rowCount - 1) {
          return row.filter(v => v).length === 0 ? y : undefined
        }
      }).filter(v => v)

      const emptyColumns = colors[0].map((col, x) => {
        return colors.map((row, y) => {
          if (x > 0 && x < columnCount - 1) {
            return row[x]
          }
        }).filter(v => v).length === 0 ? x : undefined
      }).filter(v => v)

      stateChanges = {
        ...stateChanges,
        emptyRows,
        emptyColumns
      }
    }

    if (!activeColor) {
      return stateChanges
    }

    const coords = getColorCoords(activeColor.id, colors)

    if (!isEmpty(focusCoords) && !isEqual(coords, focusCoords)) {
      stateChanges = {
        ...stateChanges,
        needsInitialFocus: false
      }
    }

    if (coords) {
      stateChanges = {
        ...stateChanges,
        activeColorCoords: coords,
        focusCoords: coords,
        levelMap: drawCircle(bloomRadius, coords[0], coords[1], colors)
      }
    }

    return stateChanges
  }

  componentDidMount () {
    const { colors, colorWallContext: { a11yFocusCell, a11yFocusChunk, a11yMaintainFocus, a11yFromKeyboard, updateA11y } } = this.props

    const maintainFocus = a11yMaintainFocus
    const fromKeyboard = a11yFromKeyboard
    const cell = a11yFocusCell

    let chunk = a11yFocusChunk
    let stateChanges = {}

    // if cell is present in our location's state but chunk is NOT...
    if (cell && !chunk) {
      // ... then gather our color grid and attempt to locate a containing chunk
      chunk = findContainingChunk(colors, cell[0], cell[1])
    }

    // if we have a cell and chunk by this point...
    if (cell && chunk) {
      // ... then we should persist those into our state changes
      stateChanges = { ...stateChanges, a11yFocusCell: cell, a11yFocusChunk: chunk }

      if (fromKeyboard) {
        // update state changes to include renderFocusOutline flag since we're assuming we're in the midst of keyboard navigation
        stateChanges = { ...stateChanges, a11yFocusOutline: true }
      }
    }

    // if we've been provided a maintainFocus flag in location state...
    if (maintainFocus) {
      // ... then we can assume we got here via keyboard.

      // attempt to return focus to this component (void if it's already focused)
      this.returnFocusToThisComponent()
    }

    // Attach listeners to document for keypress and click
    // each will toggle an internal flag off/on (say, true for keypress and false for click)
    // in our grid focus handler we'll take a look at whether our flag indicates a keypress, and if so we'll
    // activate our focus area; if not then we can assume we got here via click/tap and we can disable the outline
    document.addEventListener('keydown', this.handleBodyKeyDown)
    document.addEventListener('mousedown', this.handleBodyMouseDown)
    document.addEventListener('touchstart', this.handleBodyTouchStart)

    if (this._gridWrapperRef && this._gridWrapperRef.current) {
      const current = this._gridWrapperRef.current
      current.addEventListener('keydown', this.handleGridKeyDown)
      current.addEventListener('blur', this.handleGridBlur)
      current.addEventListener('focus', this.handleGridFocus, {
        capture: true
      })
    }

    if (!isEmpty(stateChanges)) {
      updateA11y(stateChanges)
    }
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    const { showAll, activeColor, colors, colorMap, colorWallContext: { a11yFocusCell, updateA11y }, liveAnnouncerContext: { announceAssertive }, intl: { formatMessage } } = this.props
    const { activeColor: oldActiveColor } = prevProps
    const { activeColorCoords, emptyRows, emptyColumns, focusCoords, levelMap } = this.state
    const { activeColorCoords: oldActiveColorCoords, focusCoords: oldFocusCoords } = prevState

    // if activeColor has updated...
    if (activeColor !== oldActiveColor) {
      // ... we must now update a11yFocusCell & chunk to match

      // if our new active color coords do not match our a11y focus cell's coords...
      if (!isEqual(activeColorCoords, a11yFocusCell)) {
        // ... we'll need to update the a11yFocus values to match it

        // find the containing chunk around the active color's coordinates
        const containingChunk = findContainingChunk(colors, activeColorCoords[0], activeColorCoords[1])

        // if we have successfully located a containing chunk...
        if (containingChunk) {
          // ... set it and the focus cell in state
          updateA11y({ a11yFocusCell: clone(activeColorCoords), a11yFocusChunk: containingChunk })
        }
      }
    }

    // cell should be a 2-value array representing location in the colors grid
    if (isArray(a11yFocusCell)) {
      const focusedColorId: ProbablyColorId = at(colors, `[${a11yFocusCell[1]}][${a11yFocusCell[0]}]`)[0]

      if (focusedColorId) {
        const focusedColor: Color = colorMap[focusedColorId]
        const thisLevel: ColorReference = levelMap[focusedColorId]

        if (thisLevel && thisLevel.level === 0) {
          announceAssertive(formatMessage({ id: 'SWATCH_ACTIVATED_DETAILS' }, { color: focusedColor.name }))
        } else {
          announceAssertive(formatMessage({ id: 'SWATCH_FOCUS' }, { color: fullColorName(focusedColor.brandKey, focusedColor.colorNumber, focusedColor.name) }))
        }
      }
    }

    if (showAll) {
      return
    }

    let newCoords: ?{x: number, y: number} = getCoordsObjectFromPairs([
      focusCoords,
      activeColorCoords
    ])

    let oldCoords: ?{x: number, y: number} = getCoordsObjectFromPairs([
      oldFocusCoords,
      oldActiveColorCoords
    ])

    // if the grid's DOM node exists, AND oldCoords and newCoords both exist, AND they have different values...
    if (this._gridWrapperRef && this._gridWrapperRef.current && newCoords && oldCoords && !isEqual(oldCoords, newCoords)) {
      // ... then we can assume at this point that we need to visually scroll the grid to the new focal point
      const gridEl = this._gridWrapperRef.current.querySelector('.ReactVirtualized__Grid')

      if (gridEl) {
        clearTimeout(this._scrollTimeout)

        // we need to calculate an offset for empty rows and columns because they can be narrower than populated cells
        const emptyColumnOffset = emptyColumns.filter(v => v < newCoords.x).length * this._cellSize * (1 - COLLAPSED_CELL_SIZE_RATIO)
        const emptyRowOffset = emptyRows.filter(v => v < newCoords.y).length * this._cellSize * (1 - COLLAPSED_CELL_SIZE_RATIO)

        this._scrollTimeout = setTimeout(() => {
          const scrollToX = (newCoords.x * this._cellSize) - emptyColumnOffset - (this._gridWidth - this._cellSize) / 2
          const scrollToY = (newCoords.y * this._cellSize) - emptyRowOffset - (this._gridHeight - this._cellSize) / 2

          while (this._scrollInstances && this._scrollInstances.length) {
            this._scrollInstances.pop().call()
          }

          this._scrollInstances = [
            scroll.left(gridEl, scrollToX, { duration: !IS_IE ? GRID_AUTOSCROLL_SPEED : 0 }),
            scroll.top(gridEl, scrollToY, { duration: !IS_IE ? GRID_AUTOSCROLL_SPEED : 0 })
          ]
        }, (varValues.colorWall.swatchActivateDelayMS + varValues.colorWall.swatchActivateDurationMS) * 1.2)
      }
    }
  }

  componentWillUnmount () {
    while (this._scrollInstances && this._scrollInstances.length) {
      this._scrollInstances.pop().call()
    }

    document.removeEventListener('keydown', this.handleBodyKeyDown)
    document.removeEventListener('click', this.handleBodyMouseDown)
    document.removeEventListener('touchstart', this.handleBodyTouchStart)

    if (this._gridWrapperRef && this._gridWrapperRef.current) {
      const current = this._gridWrapperRef.current
      current.removeEventListener('focus', this.handleGridFocus)
      current.removeEventListener('blur', this.handleGridBlur)
      current.removeEventListener('keydown', this.handleGridKeyDown)
    }

    this._scrollInstances = void (0)
    this._gridWrapperRef = void (0)
  }

  // END LIFECYCLE METHODS
  // -----------------------------------------------

  // -----------------------------------------------
  // ACTIONS

  addColor = function addColor (newColor: Color) {
    const { onAddColor } = this.props
    onAddColor && onAddColor(newColor)
  }

  // END ACTIONS
  // -----------------------------------------------

  // -----------------------------------------------
  // HANDLERS

  handleBodyKeyDown = function handleBodyKeyDown () { this._recentKeypress = true }

  handleBodyMouseDown = function handleBodyMouseDown () { this._recentKeypress = false }

  handleBodyTouchStart = function handleBodyTouchStart () { this._recentKeypress = false }

  handleGridKeyDown = function handleGridKeyDown (e: any) {
    const { colors, history: { push }, showAll, colorWallContext: { a11yFocusCell, a11yFocusChunk, updateA11y }, zoomOutUrl } = this.props
    const { activeColorCoords } = this.state
    const { shiftKey } = e

    let newA11yFocusChunk
    let newA11yFocusCell

    // HANDLE UP/DOWN/LEFT/RIGHT
    if (!isEmpty(a11yFocusCell) && !isEmpty(a11yFocusChunk)) {
      // we have a currently-focused cell in a chunk; let's move right (increment x)
      const { TL, BR } = a11yFocusChunk
      const x = a11yFocusCell[0]
      const y = a11yFocusCell[1]

      switch (e.keyCode) {
        // left
        case 37: {
          newA11yFocusCell = [Math.max(x - 1, TL[0]), y]
          break
        }
        // up
        case 38: {
          newA11yFocusCell = [x, Math.max(y - 1, TL[1])]
          break
        }
        // right
        case 39: {
          newA11yFocusCell = [Math.min(x + 1, BR[0]), y]
          break
        }
        // down
        case 40: {
          newA11yFocusCell = [x, Math.min(y + 1, BR[1])]
          break
        }
        // enter
        case 13:
          // space? do we need this?
        case 32: {
          const colorId = colors[y][x]

          if (!colorId) {
            return
          }

          const swatchAPI = at(this._swatchRefs, `[${colorId}].current`)[0]

          if (swatchAPI) {
            if (swatchAPI.externalLink) {
              window.location.href = swatchAPI.externalLink
              return
            } else if (swatchAPI.internalLink) {
              push(swatchAPI.internalLink)
            }

            if (swatchAPI.onClick) {
              swatchAPI.onClick(e)
            }
          }

          e.stopPropagation()
          e.preventDefault()
          break
        }
      }

      // if we've successfully moved within our existing chunk (and we should have)...
      if (newA11yFocusCell) {
        // ... then forward the existing chunk reference along as our "new" chunk; we'll keep it
        newA11yFocusChunk = a11yFocusChunk

        // if the focus cells haven't changed, set the new to the old so we aren't updating needlessly
        if (isEqual(newA11yFocusCell, a11yFocusCell)) {
          newA11yFocusCell = a11yFocusCell
          // NOTE: we SHOULD just be able to return here, since this means the user is just pressing
          // a direction they can't actually move
          return
        }
      }
    }

    switch (e.keyCode) {
      // escape
      case 27: {
        // if the user presses the escape key and we are zoomed in (or: not showing all)...
        if (!showAll) {
          // ... then push the zoomed-out URL, which is effectively just the current URL minus the color/{colorId}/{colorName} bits
          push(zoomOutUrl)

          e.stopPropagation()
          e.preventDefault()
          return
        }
        break
      }
      // tab
      case 9: {
        if (shiftKey) {
          // go up a column
          if (isEmpty(a11yFocusChunk)) {
            // ... try to select the first chunk
            const lastChunk = findChunkFromCorner(colors, -1, -1, false)

            if (lastChunk) {
              newA11yFocusChunk = lastChunk
              newA11yFocusCell = [lastChunk.TL[0], lastChunk.TL[1]]
            } else {
              // if we can't select a first chunk, just let the tab flow through to get the user out of the color wall
              updateA11y({ a11yFocusChunk: void (0), a11yFocusCell: void (0), a11yMaintainFocus: false })
              return
            }
          } else {
            // ... otherwise work with our existing focused chunk
            const searchWidth = Math.abs(a11yFocusChunk.BR[0] - a11yFocusChunk.TL[0]) + 1
            const nextChunkUp = findChunkFromCorner(colors, a11yFocusChunk.BR[0], a11yFocusChunk.TL[1] - 1, false, searchWidth)

            if (nextChunkUp) {
              newA11yFocusChunk = nextChunkUp
              newA11yFocusCell = [nextChunkUp.TL[0], nextChunkUp.TL[1]]
            } else {
              const nextChunkBack = findChunkFromCorner(colors, a11yFocusChunk.TL[0] - 1, -1, false)

              if (nextChunkBack) {
                newA11yFocusChunk = nextChunkBack
                newA11yFocusCell = [nextChunkBack.TL[0], nextChunkBack.TL[1]]
              } else {
                // if we can't select a "next chunk over," assume we've reached the end and allow the user to tab out
                updateA11y({
                  a11yFocusChunk: void (0),
                  a11yFocusCell: void (0),
                  a11yMaintainFocus: false
                })

                return
              }
            }
          }
        } else {
          // go down a column
          // if we have no current chunk...
          if (isEmpty(a11yFocusChunk)) {
            // ... try to select the first chunk
            const firstChunk = findChunkFromCorner(colors, 0, 0)

            if (firstChunk) {
              newA11yFocusChunk = firstChunk
              newA11yFocusCell = [firstChunk.TL[0], firstChunk.TL[1]]
            } else {
              // if we can't select a first chunk, just let the tab flow through to get the user out of the color wall
              updateA11y({ a11yFocusChunk: void (0), a11yFocusCell: void (0), a11yMaintainFocus: false })
              return
            }
          } else {
            // ... otherwise work with our existing focused chunk
            const nextChunkDown = findChunkFromCorner(colors, a11yFocusChunk.TL[0], a11yFocusChunk.BR[1] + 1)

            if (nextChunkDown) {
              newA11yFocusChunk = nextChunkDown
              newA11yFocusCell = [nextChunkDown.TL[0], nextChunkDown.TL[1]]
            } else {
              const nextChunkOver = findChunkFromCorner(colors, a11yFocusChunk.BR[0] + 1, 0)

              if (nextChunkOver) {
                newA11yFocusChunk = nextChunkOver
                newA11yFocusCell = [nextChunkOver.TL[0], nextChunkOver.TL[1]]
              } else {
                // if we can't select a "next chunk over," assume we've reached the end and allow the user to tab out
                updateA11y({ a11yFocusChunk: void (0), a11yFocusCell: void (0), a11yMaintainFocus: false })
                return
              }
            }
          }
        }

        // if we are alighting upon a new chunk, see if we have active coordinates within it so that they might be selected
        // we only want to run this on a tab action so that we don't override up/down/left/right actions
        if (newA11yFocusChunk &&
          activeColorCoords.length &&
          isEqual(findContainingChunk(colors, activeColorCoords[0], activeColorCoords[1]), newA11yFocusChunk)) {
          newA11yFocusCell = activeColorCoords
        }

        break
      }
    }

    // if our focus values are empty...
    if (isEmpty(newA11yFocusCell) && isEmpty(newA11yFocusChunk)) {
      return
    }

    // if our focus values haven't changed...
    if (newA11yFocusCell === a11yFocusCell && newA11yFocusChunk === a11yFocusChunk) {
      return
    }

    // if we're here, update. it's expensive so we want to guard it well.
    updateA11y({ a11yFocusCell: newA11yFocusCell, a11yFocusChunk: newA11yFocusChunk, a11yFocusOutline: true, a11yMaintainFocus: true })

    e.stopPropagation()
    e.preventDefault()
  }

  handleGridResize = function handleGridResize ({ width, height }) {
    this._gridHeight = height
    this._gridWidth = width
  }

  handleGridFocus = function handleGridFocus (e: any) {
    // check focus cell/chunk here; if they don't exist you'll need to define them and set state
    const { activeColor, colors, colorWallContext: { a11yFocusCell, a11yFocusOutline, updateA11y } } = this.props
    let newState = { a11yFocusOutline: a11yFocusOutline ? true : this._recentKeypress }

    if (isEmpty(a11yFocusCell)) {
      let cell, chunk

      if (activeColor) {
        cell = getColorCoords(activeColor.id, colors)

        if (cell) {
          chunk = findContainingChunk(colors, cell[0], cell[1])
        }
      } else {
        chunk = findChunkFromCorner(colors, 0, 0)

        if (chunk) {
          cell = chunk.TL
        }
      }

      if (cell && chunk) {
        newState = { ...newState, a11yFocusCell: cell, a11yFocusChunk: chunk }
      }
    }

    updateA11y(newState)
  }

  handleGridBlur = function handleGridBlur (e: any) {
    const { colorWallContext: { a11yFocusOutline, updateA11y } } = this.props
    a11yFocusOutline && updateA11y({ a11yFocusOutline: false })
  }

  // END HANDLERS
  // -----------------------------------------------

  // -----------------------------------------------
  // OTHER METHODS

  generateMakeSwatchRef = (colorId: string): RefObject => (this._swatchRefs[colorId] = this._swatchRefs[colorId] || React.createRef())

  cellRenderer = function cellRenderer ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }: Object) {
    const { colors, colorMap, immediateSelectionOnActivation, onAddColor, swatchLinkGenerator, colorWallContext, colorStatuses, showAll } = this.props
    const { a11yFocusCell, a11yFocusChunk, a11yFocusOutline } = colorWallContext
    const { levelMap } = this.state
    const colorId = colors[rowIndex][columnIndex]

    let focus = false

    if (!colorId) {
      return null
    } else if (typeof colorId === 'object') {
      const height = Math.min(parseInt(style.height, 10) * 0.75, 14)
      const _style = {
        ...style,
        fontSize: `${height}px`
      }

      return (
        <div key={key} style={_style} role='presentation'>
          <div className={`color-wall-swatch-list__section-title ${!showAll ? 'color-wall-swatch-list__section-title--push-up' : ''}`} title={colorId.label} style={{
            width: `${colorId.columnWidth * 100}%`,
            marginLeft: `-${(Math.ceil(colorId.columnWidth / 2) - 1) * 100}%`
          }}>
            {colorId.label}
          </div>
        </div>
      )
    }

    const color: Color = colorMap[colorId]
    const thisLevel: ColorReference = levelMap[colorId]
    const linkToSwatch: string = swatchLinkGenerator(color)
    const thisStatus: ColorStatus | typeof undefined = colorStatuses && colorStatuses[colorId]
    const isDisabled = at(thisStatus, 'status')[0] === 0
    const message = at(thisStatus, 'message')[0]

    // if we can render the focus outline AND if we have a focused chunk AND a11yFocusCell has values...
    // ... AND if we have focused cell coordinates that match this particular cell/row index...
    if (a11yFocusOutline && a11yFocusChunk && isArray(a11yFocusCell) && isEqual(a11yFocusCell, [columnIndex, rowIndex])) {
      // ... then set our focus var to true; we'll pass it as a param to the rendered swatch in this cell
      focus = true
    }

    let renderedSwatch
    if (thisLevel) {
      const showContents = thisLevel.level === 0
      // ALL of the bloomed swatches in the zoomed-in view
      renderedSwatch = (
        <ColorWallSwatch
          tabIndex={-1}
          showContents={showContents}
          thisLink={linkToSwatch}
          onAdd={onAddColor ? this.addColor : void (0)}
          onClick={this.returnFocusToThisComponent}
          message={message}
          color={color}
          level={thisLevel.level}
          ref={this.generateMakeSwatchRef(colorId)}
          compensateX={isFunction(thisLevel.compensateX) ? thisLevel.compensateX() : 0}
          compensateY={isFunction(thisLevel.compensateY) ? thisLevel.compensateY() : 0}
          disabled={isDisabled}
          focus={focus}
        />
      )
    } else if (isScrolling) {
      // ALL non-bloomed swatches when scrolling, the least complicated swatch option purely a display element, no interactivity
      renderedSwatch = (<ColorWallSwatchRenderer color={color.hex} focus={focus} disabled={isDisabled} />)
    } else if (immediateSelectionOnActivation) {
      // a color swatch that behaves as a button and that's it this is the swatch used in zoomed-out non-bloomed view
      renderedSwatch = (
        <ColorWallSwatchUI
          tabIndex={-1}
          color={color}
          thisLink={linkToSwatch}
          onClick={this.returnFocusToThisComponent}
          ref={this.generateMakeSwatchRef(colorId)}
          disabled={isDisabled}
          focus={focus}
        />
      )
    } else {
      // a normal color swatch that behaves as a button and also is able to be visually activated (not just behave like a button)... a bloomable swatch, basically
      // ALL non-bloomed swatches in the zoomed-in view
      renderedSwatch = (
        <ColorWallSwatch
          tabIndex={-1}
          thisLink={linkToSwatch}
          color={color}
          onClick={this.returnFocusToThisComponent}
          ref={this.generateMakeSwatchRef(colorId)}
          disabled={isDisabled}
          focus={focus}
        />
      )
    }

    return (
      <div key={key} style={style} role='presentation'>
        <ChunkBoundary render={a11yFocusOutline} bounds={a11yFocusChunk} x={columnIndex} y={rowIndex} />
        {renderedSwatch}
      </div>
    )
  }

  returnFocusToThisComponent = function returnFocusToThisComponent (): boolean {
    if (this._gridWrapperRef && this._gridWrapperRef.current && this._gridWrapperRef.current !== document.activeElement) {
      // ... then focus on the grid wrapper so we can get right back to navigating the grid with the keyboard
      this._gridWrapperRef.current.focus()
      return true
    }

    return false
  }

  // END OTHER METHODS
  // -----------------------------------------------
}

export default withRouter(injectIntl(withColorWallContext(WithLiveAnnouncerContext(ColorWallSwatchList))))
