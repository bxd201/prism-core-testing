// @flow
import React, { PureComponent } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import memoizee from 'memoizee'
import isEqual from 'lodash/isEqual'
import isEmpty from 'lodash/isEmpty'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import clone from 'lodash/clone'
import * as scroll from 'scroll'
import { withRouter } from 'react-router-dom'
import { LiveMessage } from 'react-aria-live'
import { injectIntl } from 'react-intl'

import { varValues } from 'variables'
import ColorWallSwatch from './ColorWallSwatch/ColorWallSwatch'
import ColorWallSwatchUI from './ColorWallSwatch/ColorWallSwatchUI'
import ColorWallSwatchRenderer from './ColorWallSwatch/ColorWallSwatchRenderer'
import ChunkBoundary from './ChunkBoundary'
import { type ColorMap, type Color, type ProbablyColorId, type ColorIdGrid } from '../../../shared/types/Colors'
import { getColorCoords, drawCircle, getCoordsObjectFromPairs, findContainingChunk, findChunkFromCorner, overscanIndicesGetter } from './ColorWallUtils'
import { getTotalWidthOf2dArray } from '../../../shared/helpers/DataUtils'
import { generateColorWallPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { type GridBounds, type ColorReference } from './ColorWall.flow'

import 'src/scss/externalComponentSupport/AutoSizer.scss'
import './ColorWallSwatchList.scss'

const GRID_AUTOSCROLL_SPEED: number = 300

// ----------------------------------------
// PROP TYPES
type IntlProps = {
  intl: {
    formatMessage: Function
  }
}

type RouterProps = {
  location: any,
  history: any
}

type Props = IntlProps & RouterProps & {
  colors: ColorIdGrid, // eslint-disable-line react/no-unused-prop-types
  contain: boolean,
  minCellSize: number,
  maxCellSize: number,
  bloomRadius: number,
  colorMap: ColorMap,
  swatchLinkGenerator: Function,
  section: string | void,
  family: string | void,
  activeColor?: Color, // eslint-disable-line react/no-unused-prop-types
  showAll?: boolean,
  immediateSelectionOnActivation?: boolean,
  onAddColor?: Function,
  onActivateColor?: Function
}

// END PROP TYPES
// ----------------------------------------

// ----------------------------------------
// STATE TYPES

type DerivedStateFromProps = {
  activeColorCoords: number[],
  focusCoords: number[],
  levelMap: {
    [ key: string ]: ColorReference
  },
  needsInitialFocus: boolean
}

type State = DerivedStateFromProps & {
  a11yFocusChunk: GridBounds,
  a11yFocusCell: number[] | void,
  renderFocusOutline: boolean
}

// END STATE TYPES
// ----------------------------------------

class ColorWallSwatchList extends PureComponent<Props, State> {
  _gridWrapperRef: ?RefObject = void (0)
  _swatchRefs: {
    // This will wind up being one of the ColorWallSwatch components
    [key: string]: any
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
    needsInitialFocus: true,
    renderFocusOutline: false,
    activeColorCoords: [],
    focusCoords: [],
    levelMap: {},
    a11yFocusChunk: void (0),
    a11yFocusCell: void (0)
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
    this.generateHandleSwatchClick = this.generateHandleSwatchClick.bind(this)
    this.returnFocusToThisComponent = this.returnFocusToThisComponent.bind(this)
    this.getAudioMessaging = this.getAudioMessaging.bind(this)

    this._gridWrapperRef = React.createRef()
    this._swatchRefs = {}
  }

  // -----------------------------------------------
  // LIFECYCLE METHODS

  render () {
    const { minCellSize, maxCellSize, showAll, activeColor, colors, contain } = this.props
    const { focusCoords, needsInitialFocus, a11yFocusChunk, a11yFocusCell, renderFocusOutline } = this.state
    const colorIdGrid = colors
    const rowCount = colorIdGrid.length
    const columnCount = getTotalWidthOf2dArray(colorIdGrid)
    const focusMessaging = this.getAudioMessaging()

    let addlGridProps = {}

    if (focusCoords && focusCoords.length && needsInitialFocus) {
      addlGridProps.scrollToColumn = focusCoords[0]
      addlGridProps.scrollToRow = focusCoords[1]
    }

    // if our focus outlines can be shown and we have a value for our a11y focus cell...
    if (renderFocusOutline && a11yFocusCell && a11yFocusCell.length) {
      // ... set scrollToColumn/Row props for grid to a11yFocusCell
      addlGridProps = {
        ...addlGridProps,
        scrollToColumn: a11yFocusCell[0],
        scrollToRow: a11yFocusCell[1]
      }
    }

    return (
      <React.Fragment>
        {focusMessaging
          ? <LiveMessage message={focusMessaging} aria-live='assertive' clearOnUnmount='true' />
          : null
        }

        <section className={`color-wall-swatch-list ${contain ? 'color-wall-swatch-list--contain' : ''}`}
          role='application'
          tabIndex={0} // eslint-disable-line
          ref={this._gridWrapperRef}>
          <AutoSizer onResize={this.handleGridResize} disableHeight={!contain}>
            {({ height = 0, width }) => {
              let size = maxCellSize

              if (showAll) {
                size = Math.max(Math.min(width / columnCount, maxCellSize), minCellSize)
              }

              const gridHeight = contain ? height : Math.max(height, rowCount * size)

              // keep tabs on our current size since it can very between min/maxCellSize
              this._cellSize = size

              return (
                <Grid
                  _forceRenderProp={activeColor}
                  _forceRenderProp2={a11yFocusChunk}
                  _forceRenderProp3={a11yFocusCell}
                  _forceRenderProp4={showAll}
                  _forceRenderProp5={colorIdGrid}
                  _forceRenderProp6={renderFocusOutline}
                  scrollToAlignment='center'
                  cellRenderer={this.cellRenderer}
                  columnWidth={size}
                  columnCount={columnCount}
                  overscanColumnCount={6}
                  overscanRowCount={6}
                  rowHeight={size}
                  rowCount={rowCount}
                  width={width}
                  height={gridHeight}
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
      </React.Fragment>
    )
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    const { bloomRadius, activeColor, colors, history: { location: { state: routerState } } } = props
    const { focusCoords } = state

    let stateChanges = { ...state }

    if (!(stateChanges.a11yFocusCell || stateChanges.a11yFocusChunk) &&
      routerState &&
      (routerState.a11yFocusCell || routerState.a11yFocusChunk)) {
      stateChanges = {
        ...stateChanges,
        a11yFocusCell: routerState.a11yFocusCell,
        a11yFocusChunk: routerState.a11yFocusChunk
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

    // TODO: compare coords against a11yFocusCell; if different, update

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
    const { location: { state }, colors } = this.props

    const maintainFocus = state && state.maintainFocus
    const fromKeyboard = state && state.fromKeyboard
    const cell = state && state.a11yFocusCell

    let chunk = state && state.a11yFocusChunk
    let stateChanges = {}

    // if cell is present in our location's state but chunk is NOT...
    if (cell && !chunk) {
      // ... then gather our color grid and attempt to locate a containing chunk
      chunk = findContainingChunk(colors, cell[0], cell[1])
    }

    // if we have a cell and chunk by this point...
    if (cell && chunk) {
      // ... then we should persist those into our state changes
      stateChanges = {
        ...stateChanges,
        a11yFocusCell: cell,
        a11yFocusChunk: chunk
      }

      if (fromKeyboard) {
        // update state changes to include renderFocusOutline flag since we're assuming we're in the midst of keyboard navigation
        stateChanges = {
          ...stateChanges,
          renderFocusOutline: true
        }
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
      this.setState(stateChanges)
    }
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    const { showAll, activeColor, colors } = this.props
    const { activeColor: oldActiveColor } = prevProps
    const { activeColorCoords, focusCoords, a11yFocusCell } = this.state
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
          // eslint-disable-next-line
          this.setState({
            a11yFocusCell: clone(activeColorCoords),
            a11yFocusChunk: containingChunk
          })
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
    if (this._gridWrapperRef && this._gridWrapperRef.current && (newCoords && oldCoords && !isEqual(oldCoords, newCoords))) {
      // ... then we can assume at this point that we need to visually scroll the grid to the new focal point
      const gridEl = this._gridWrapperRef.current.querySelector('.ReactVirtualized__Grid')

      if (gridEl) {
        clearTimeout(this._scrollTimeout)

        this._scrollTimeout = setTimeout(() => {
          const scrollToX = newCoords.x * this._cellSize - (this._gridWidth - this._cellSize) / 2
          const scrollToY = newCoords.y * this._cellSize - (this._gridHeight - this._cellSize) / 2

          while (this._scrollInstances && this._scrollInstances.length) {
            this._scrollInstances.pop().call()
          }

          this._scrollInstances = [
            scroll.left(gridEl, scrollToX, { duration: GRID_AUTOSCROLL_SPEED }),
            scroll.top(gridEl, scrollToY, { duration: GRID_AUTOSCROLL_SPEED })
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

    if (onAddColor) {
      onAddColor(newColor)
    }
  }

  // END ACTIONS
  // -----------------------------------------------

  // -----------------------------------------------
  // HANDLERS

  handleBodyKeyDown = function handleBodyKeyDown () {
    this._recentKeypress = true
  }

  handleBodyMouseDown = function handleBodyMouseDown () {
    this._recentKeypress = false
  }

  handleBodyTouchStart = function handleBodyTouchStart () {
    this._recentKeypress = false
  }

  handleGridKeyDown = function handleGridKeyDown (e: any) {
    const { colors, history: { push }, section, family, showAll } = this.props
    const { activeColorCoords, a11yFocusChunk, a11yFocusCell } = this.state
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
        case 37: // left
          newA11yFocusCell = [Math.max(x - 1, TL[0]), y]
          break
        case 38: // up
          newA11yFocusCell = [x, Math.max(y - 1, TL[1])]
          break
        case 39: // right
          newA11yFocusCell = [Math.min(x + 1, BR[0]), y]
          break
        case 40: // down
          newA11yFocusCell = [x, Math.min(y + 1, BR[1])]
          break
        case 13: // enter
        case 32: // space? do we need this?
          const colorId = colors[y][x]

          if (!colorId) {
            return
          }

          const targetedSwatchEl = this._swatchRefs[colorId]

          if (targetedSwatchEl && isFunction(targetedSwatchEl.getThisLink)) {
            push(targetedSwatchEl.getThisLink(targetedSwatchEl), {
              a11yFocusChunk,
              a11yFocusCell,
              fromKeyboard: true,
              maintainFocus: true
            })
          } else if (targetedSwatchEl && isFunction(targetedSwatchEl.performClickAction)) {
            targetedSwatchEl.performClickAction(targetedSwatchEl)
          }

          e.stopPropagation()
          e.preventDefault()
          break
      }

      // if we've successfully moved within our existing chunk (and we should have)...
      if (newA11yFocusCell) {
        // ... then forward the existing chunk reference along as our "new" chunk; we'll keep it
        newA11yFocusChunk = a11yFocusChunk
      }
    }

    switch (e.keyCode) {
      case 27: // escape
        // if the user presses the escape key and we are zoomed in (or: not showing all)...
        if (!showAll) {
          // ... then navigate to the color wall URL of the current section and family (if they exist), effectively zooming out
          // also pass our current focused chunk and cell as persistent state
          push(generateColorWallPageUrl(section, family), {
            a11yFocusChunk,
            a11yFocusCell,
            fromKeyboard: true,
            maintainFocus: true
          })

          e.stopPropagation()
          e.preventDefault()
        }
        break
      case 9: // tab
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
              this.setState({
                a11yFocusChunk: void (0),
                a11yFocusCell: void (0)
              })

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
                this.setState({
                  a11yFocusChunk: void (0),
                  a11yFocusCell: void (0)
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
              this.setState({
                a11yFocusChunk: void (0),
                a11yFocusCell: void (0)
              })

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
                this.setState({
                  a11yFocusChunk: void (0),
                  a11yFocusCell: void (0)
                })

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
    }

    if (!isEmpty(newA11yFocusCell) || !isEmpty(newA11yFocusChunk)) {
      this.setState({
        a11yFocusCell: newA11yFocusCell,
        a11yFocusChunk: newA11yFocusChunk,
        // always render focus outline if we've had successfuly keyboard navigation within the grid
        renderFocusOutline: true
      })

      e.stopPropagation()
      e.preventDefault()
    }
  }

  handleGridResize = function handleGridResize ({ width, height }) {
    this._gridHeight = height
    this._gridWidth = width
  }

  handleGridFocus = function handleGridFocus (e: any) {
    // check focus cell/chunk here; if they don't exist you'll need to define them and set state
    const { activeColor, colors } = this.props
    const { a11yFocusCell, renderFocusOutline } = this.state

    let newState = {
      renderFocusOutline: renderFocusOutline ? true : this._recentKeypress
    }

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
        newState = {
          ...newState,
          a11yFocusCell: cell,
          a11yFocusChunk: chunk
        }
      }
    }

    this.setState(newState)
  }

  handleGridBlur = function handleGridBlur (e: any) {
    const { renderFocusOutline } = this.state

    if (renderFocusOutline) {
      this.setState({
        renderFocusOutline: false
      })
    }
  }

  generateHandleSwatchClick = memoizee(function handleSwatchClick (color: Color) {
    return (e: any) => {
      const { history: { push }, colors, swatchLinkGenerator } = this.props
      const link: string = swatchLinkGenerator(color)
      const coords = getColorCoords(color.id, colors)

      if (e && isFunction(e.preventDefault)) {
        e.preventDefault()
      }

      this.returnFocusToThisComponent()

      push(link, {
        a11yFocusCell: coords,
        maintainFocus: true
      })
    }
  }, { primitive: true, length: 1 })

  // END HANDLERS
  // -----------------------------------------------

  // -----------------------------------------------
  // OTHER METHODS

  generateMakeSwatchRef = memoizee(function makeSwatchRef (colorId: string) {
    return (el) => {
      this._swatchRefs[colorId] = el
    }
  })

  cellRenderer = function cellRenderer ({
    columnIndex, // Horizontal (column) index of cell
    isScrolling, // The Grid is currently being scrolled
    isVisible, // This cell is visible within the grid (eg it is not an overscanned cell)
    key, // Unique key within array of cells
    parent, // Reference to the parent Grid (instance)
    rowIndex, // Vertical (row) index of cell
    style // Style object to be applied to cell (to position it)
  }: Object) {
    const { colors, colorMap, immediateSelectionOnActivation, onAddColor, swatchLinkGenerator } = this.props
    const { levelMap, a11yFocusChunk, a11yFocusCell, renderFocusOutline } = this.state
    const colorId = colors[rowIndex][columnIndex]

    if (!colorId) {
      return null
    }

    const color: Color = colorMap[colorId]
    const thisLevel: ColorReference = levelMap[colorId]
    const linkToSwatch: string = swatchLinkGenerator(color)

    let focus = false
    let renderedSwatch

    // if we can render the focus outline AND if we have a focused chunk AND a11yFocusCell has values...
    // ... AND if we have focused cell coordinates that match this particular cell/row index...
    if (renderFocusOutline && a11yFocusChunk && isArray(a11yFocusCell) && isEqual(a11yFocusCell, [columnIndex, rowIndex])) {
      // ... then set our focus var to true; we'll pass it as a param to the rendered swatch in this cell
      focus = true
    }

    if (thisLevel) {
      // ALL of the bloomed swatches in the zoomed-in view
      renderedSwatch = (
        <ColorWallSwatch
          showContents={thisLevel.level === 0}
          thisLink={linkToSwatch}
          onAdd={onAddColor ? this.addColor : void (0)}
          color={color}
          level={thisLevel.level}
          compensateX={isFunction(thisLevel.compensateX) ? thisLevel.compensateX() : 0}
          compensateY={isFunction(thisLevel.compensateY) ? thisLevel.compensateY() : 0}
          focus={focus} />
      )
    } else if (isScrolling) {
      // ALL non-bloomed swatches when scrolling, the least complicated swatch option
      // purely a display element, no interactivity
      renderedSwatch = (
        <ColorWallSwatchRenderer
          color={color.hex}
          focus={focus} />
      )
    } else if (immediateSelectionOnActivation) {
      // a color swatch that behaves as a button and that's it
      // this is the swatch used in zoomed-out non-bloomed view
      renderedSwatch = (
        <ColorWallSwatchUI
          color={color}
          thisLink={linkToSwatch}
          onClick={this.generateHandleSwatchClick(color)}
          ref={this.generateMakeSwatchRef(colorId)}
          focus={focus} />
      )
    } else {
      // a normal color swatch that behaves as a button and also is able to be visually activated (not just behave like a button)... a bloomable swatch, basically
      // ALL non-bloomed swatches in the zoomed-in view
      renderedSwatch = (
        <ColorWallSwatch
          thisLink={linkToSwatch}
          color={color}
          onClick={this.generateHandleSwatchClick(color)}
          focus={focus} />
      )
    }

    return (
      <div key={key} style={style} role='presentation'>
        <ChunkBoundary
          render={renderFocusOutline}
          bounds={a11yFocusChunk}
          x={columnIndex}
          y={rowIndex} />

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

  getAudioMessaging = function getAudioMessaging (cell?: number[]): string | void {
    const { colors, colorMap, intl } = this.props
    const { a11yFocusCell, levelMap } = this.state
    const _cell = cell || a11yFocusCell

    if (!_cell) {
      return void (0)
    }

    const focusedColorId: ProbablyColorId = colors[_cell[1]][_cell[0]]

    if (focusedColorId) {
      const focusedColor: Color = colorMap[focusedColorId]
      const thisLevel: ColorReference = levelMap[focusedColorId]

      if (thisLevel && thisLevel.level === 0) {
        return intl.formatMessage({
          id: 'SWATCH_ACTIVATED_DETAILS'
        }, {
          color: focusedColor.name
        })
      } else {
        return intl.formatMessage({
          id: 'SWATCH_FOCUS'
        }, {
          color: fullColorName(focusedColor.brandKey, focusedColor.colorNumber, focusedColor.name)
        })
      }
    }

    return void (0)
  }

  // END OTHER METHODS
  // -----------------------------------------------
}

// $FlowIgnore -- Flow is expecting optional argument to be populated, some issue w/ withRouter + injectIntl
export default withRouter(injectIntl(ColorWallSwatchList))
