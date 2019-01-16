// @flow
import React, { PureComponent } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import { Scroll } from 'scroll-utility'

import { varValues } from 'variables'
import ZoomTransitioner, { type ZoomPositionerProps, TransitionModes } from './ZoomTransitioner/ZoomTransitioner'
import ColorWallSwatch from './ColorWallSwatch/ColorWallSwatch'
import ColorWallSwatchUI from './ColorWallSwatch/ColorWallSwatchUI'
import ColorWallSwatchRenderer from './ColorWallSwatch/ColorWallSwatchRenderer'
import type { ColorMap, Color, ColorGrid, ColorIdGrid, ProbablyColor } from '../../../shared/types/Colors'
import { getColorCoords, drawCircle, getCoordsObjectFromPairs } from './ColorWallUtils'
import { getTotalWidthOf2dArray } from '../../../shared/helpers/DataUtils'

type Props = {
  colors: ColorGrid, // eslint-disable-line react/no-unused-prop-types
  minCellSize: number,
  maxCellSize: number,
  bloomRadius: number,
  colorMap: ColorMap,
  swatchLinkGenerator: Function,
  swatchDetailsLinkGenerator: Function,
  activeColor?: Color, // eslint-disable-line react/no-unused-prop-types
  showAll?: boolean,
  immediateSelectionOnActivation?: boolean,
  onAddColor?: Function,
  onActivateColor?: Function
}

type ColorReference = {
  level: number,
  compensateX?: Function,
  compensateY?: Function
}

type DerivedStateFromProps = {
  needsInitialFocus: boolean,
  activeCoords: number[],
  focusCoords: number[],
  levelMap: {
    [ key: string ]: ColorReference
  }
}
type State = DerivedStateFromProps & {
  colorIdGrid: ColorIdGrid,
  zoomingIn: boolean,
  zoomingOut: boolean,
  zoomerInitProps?: ZoomPositionerProps
}

class ColorWallSwatchList extends PureComponent<Props, State> {
  _DOMNode = void (0)
  _scrollTimeout = void (0)
  _scrollManager = void (0)
  // internal tracking of current grid size
  _gridWidth: number = 0
  _gridHeight: number = 0
  // internal tracking of current cell size, varying between min and maxCellSize props
  _cellSize: number

  state: State = {
    needsInitialFocus: true,
    activeCoords: [],
    focusCoords: [],
    levelMap: {},
    colorIdGrid: [[]],
    zoomingIn: false,
    zoomingOut: false
  }

  static defaultProps = {
    bloomRadius: 0,
    minCellSize: 50,
    maxCellSize: 50
  }

  constructor (props: Props) {
    super(props)

    const { colors } = props

    this.addColor = this.addColor.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleGridResize = this.handleGridResize.bind(this)

    this.state.colorIdGrid = colors.map((moreColors: ProbablyColor[]) => {
      return moreColors.map((color: any) => {
        if (color && color.hasOwnProperty('id')) {
          return color.id
        }
      })
    })
  }

  static getDerivedStateFromProps (props: Props, state: State) {
    const { bloomRadius, activeColor } = props
    const { colorIdGrid, focusCoords, needsInitialFocus } = state

    let stateChanges = Object.assign({}, state)

    // if the needsInitialFocus is still set AND focusCoords have been set...
    if (needsInitialFocus && focusCoords && focusCoords.length) {
      // ... it implies that we have already performed our initial focus, so we should set the flag to false
      Object.assign(stateChanges, { needsInitialFocus: false })
    }

    if (!activeColor) {
      return stateChanges
    }

    const coords = getColorCoords(activeColor.id, colorIdGrid)

    if (coords) {
      const centerX = coords[0]
      const centerY = coords[1]

      Object.assign(stateChanges, {
        activeCoords: [ centerX, centerY ],
        focusCoords: [ centerX, centerY ],
        levelMap: drawCircle(bloomRadius, centerX, centerY, colorIdGrid)
      })
    }

    return stateChanges
  }

  addColor = function addColor (newColor: Color) {
    const { onAddColor } = this.props

    if (onAddColor) {
      onAddColor(newColor)
    }
  }

  zoomInActivate (newColor: Color) {
    const { onActivateColor } = this.props
    const { activeCoords } = this.state

    const cellSizeShowAll = this._cellSize
    const scale = Math.max(this._cellSize / this._gridWidth, 0.3)

    const activePos = [
      activeCoords[0] * cellSizeShowAll,
      activeCoords[1] * cellSizeShowAll
    ]

    let scrollOffsetL = 0
    let scrollOffsetT = 0

    if (this._DOMNode) {
      const gridEl = this._DOMNode.querySelector('.ReactVirtualized__Grid')
      if (gridEl) {
        scrollOffsetL = -gridEl.scrollLeft / scale
        scrollOffsetT = -gridEl.scrollTop / scale
      }
    }

    let zoomerX = (this._gridWidth / -2) + activePos[0] + (cellSizeShowAll / 2)
    let zoomerY = (this._gridHeight / -2) + activePos[1] + (cellSizeShowAll / 2)

    zoomerX /= scale
    zoomerY /= scale

    this.setState({
      zoomerInitProps: {
        width: this._gridWidth,
        height: this._gridHeight,
        scale: scale,
        translateX: zoomerX + scrollOffsetL,
        translateY: zoomerY + scrollOffsetT
      },
      zoomingIn: true
    }, () => {
      setTimeout(() => {
        if (onActivateColor) {
          // ... call it now
          onActivateColor(newColor)
        }
      }, varValues.colorWall.exitTransitionMS)
    })
  }

  cellRenderer = function cellRenderer ({
    columnIndex, // Horizontal (column) index of cell
    isScrolling, // The Grid is currently being scrolled
    isVisible, // This cell is visible within the grid (eg it is not an overscanned cell)
    key, // Unique key within array of cells
    parent, // Reference to the parent Grid (instance)
    rowIndex, // Vertical (row) index of cell
    style // Style object to be applied to cell (to position it)
  }: Object) {
    const { levelMap, colorIdGrid } = this.state
    const { colorMap, immediateSelectionOnActivation, onAddColor, swatchLinkGenerator, swatchDetailsLinkGenerator } = this.props

    const colorId = colorIdGrid[rowIndex][columnIndex]

    if (!colorId) {
      return null
    }

    const color: Color = colorMap[colorId]
    const thisLevel: ColorReference = levelMap[colorId]
    const linkToSwatch: string = swatchLinkGenerator(color)
    const linkToDetails: string = swatchDetailsLinkGenerator(color)

    let edgeProps = {}

    if (thisLevel) {
      if (thisLevel.compensateX) {
        edgeProps.compensateX = thisLevel.compensateX()
      }

      if (thisLevel.compensateY) {
        edgeProps.compensateY = thisLevel.compensateY()
      }
    }

    return (
      <div key={key} style={style}>
        {thisLevel ? ( // a bloomed swatch
          <ColorWallSwatch showContents={thisLevel.level === 0} thisLink={linkToSwatch} detailsLink={linkToDetails} onAdd={onAddColor ? this.addColor : void (0)} color={color} level={thisLevel.level}
            {...edgeProps} />
        ) : isScrolling ? ( // all non-bloomed swatches when scrolling, the least complicated swatch option
          <ColorWallSwatchRenderer aria-colindex={columnIndex} aria-rowindex={rowIndex} color={color.hex} />
        ) : immediateSelectionOnActivation ? ( // a color swatch that behaves as a button and that's it
          <ColorWallSwatchUI color={color} thisLink={linkToSwatch} {...edgeProps} />
        ) : ( // a normal color swatch that behaves as a button and also is able to be visually activated (not just behave like a button)... a bloomable swatch, basically
          <ColorWallSwatch thisLink={linkToSwatch} detailsLink={linkToDetails} color={color} {...edgeProps} />
        )}
      </div>
    )
  }

  handleKeyDown = function handleKeyDown (e: KeyboardEvent) {
    const { colorIdGrid, focusCoords } = this.state
    const rowCount = colorIdGrid.length
    const columnCount = getTotalWidthOf2dArray(colorIdGrid)

    let x = focusCoords[0]
    let y = focusCoords[1]

    switch (e.keyCode) {
      case 37: // left
        if (x > 0) x--
        break
      case 38: // up
        if (y > 0) y--
        break
      case 39: // right
        if (x < columnCount - 1) x++
        break
      case 40: // down
        if (y < rowCount - 1) y++
        break
    }

    if (x !== focusCoords[0] || y !== focusCoords[1]) {
      this.setState({
        focusCoords: [x, y]
      })
    } else {
      e.preventDefault()
    }
  }

  handleGridResize = function handleGridResize (dims: { width: number, height: number }) {
    this._gridHeight = dims.height
    this._gridWidth = dims.width
  }

  render () {
    const { minCellSize, maxCellSize, showAll, activeColor } = this.props
    const { colorIdGrid, zoomingIn, zoomerInitProps, focusCoords, needsInitialFocus } = this.state
    const rowCount = colorIdGrid.length
    const columnCount = getTotalWidthOf2dArray(colorIdGrid)
    let addlGridProps = {}
    let transitioner = null

    if (focusCoords && focusCoords.length && needsInitialFocus) {
      addlGridProps.scrollToColumn = focusCoords[0]
      addlGridProps.scrollToRow = focusCoords[1]
    }

    if (zoomingIn && zoomerInitProps) {
      transitioner = <ZoomTransitioner position={zoomerInitProps} mode={TransitionModes.ZOOM_IN} />
    }

    return (
      <div className={`color-wall-swatch-list ${!showAll ? 'color-wall-swatch-list--zoomed' : 'color-wall-swatch-list--show-all'}`}
        onKeyDown={this.handleKeyDown}
        ref={el => { this._DOMNode = el }} role='presentation'>

        {transitioner}

        <AutoSizer onResize={this.handleGridResize}>
          {({ height, width }) => {
            let size = maxCellSize

            if (showAll) {
              size = Math.max(Math.min(width / columnCount, maxCellSize), minCellSize)
            }

            // keep tabs on our current size since it can very between min/maxCellSize
            this._cellSize = size

            return (
              <Grid
                _forceUpdateProp={activeColor}
                scrollToAlignment='center'
                cellRenderer={this.cellRenderer}
                columnWidth={size}
                columnCount={columnCount}
                height={height}
                overscanColumnCount={6}
                overscanRowCount={6}
                rowHeight={size}
                rowCount={rowCount}
                width={width}
                overscanIndicesGetter={overscanIndicesGetter}
                {...addlGridProps}
              />
            )
          }}
        </AutoSizer>
      </div>
    )
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    const { showAll } = this.props
    const { activeCoords, focusCoords } = this.state
    const { activeCoords: oldActiveCoords, focusCoords: oldFocusCoords } = prevState

    if (showAll) {
      return
    }

    let newCoords: ?{x: number, y: number} = getCoordsObjectFromPairs([
      focusCoords,
      activeCoords
    ])

    let oldCoords: ?{x: number, y: number} = getCoordsObjectFromPairs([
      oldFocusCoords,
      oldActiveCoords
    ])

    if (this._DOMNode && (newCoords && oldCoords && (oldCoords.x !== newCoords.x || oldCoords.y !== newCoords.y))) {
      const gridEl = this._DOMNode.querySelector('.ReactVirtualized__Grid')

      if (gridEl) {
        if (!this._scrollManager) {
          this._scrollManager = new Scroll(gridEl)
        }

        clearTimeout(this._scrollTimeout)

        this._scrollTimeout = setTimeout(() => {
          const scrollSpeed = 300
          const scrollToX = newCoords.x * this._cellSize - (this._gridWidth - this._cellSize) / 2
          const scrollToY = newCoords.y * this._cellSize - (this._gridHeight - this._cellSize) / 2

          if (this._scrollManager) {
            // stop any other currently-running scroll animations on this element
            this._scrollManager.stopAllAnimations()

            // scroll X and Y axes separately (can't do both at once, but the animations stack)

            // TODO: create flowtype skeleton for instances of Scroll
            // $FlowIgnore -- Flow doesn't know what instance methods exist on Scroll
            this._scrollManager.scrollTo('value', scrollToX, {
              duration: scrollSpeed,
              horizontal: true
            })

            // TODO: create flowtype skeleton for instances of Scroll
            // $FlowIgnore -- Flow doesn't know what instance methods exist on Scroll
            this._scrollManager.scrollTo('value', scrollToY, {
              duration: scrollSpeed,
              horizontal: false
            })
          }
        }, varValues.colorWall.swatchActivateDelayMS + varValues.colorWall.swatchActivateDurationMS)
      }
    }
  }
}

function overscanIndicesGetter ({
  direction, // One of "horizontal" or "vertical"
  cellCount, // Number of rows or columns in the current axis
  scrollDirection, // 1 (forwards) or -1 (backwards)
  overscanCellsCount, // Maximum number of cells to over-render in either direction
  startIndex, // Begin of range of visible cells
  stopIndex // End of range of visible cells
}) {
  // this is needed to get overscan compensation in both directions at all times
  const overscanStartIndex = Math.max(0, startIndex - overscanCellsCount)
  const overscanStopIndex = Math.min(cellCount - 1, stopIndex + overscanCellsCount)

  return {
    overscanStartIndex: overscanStartIndex,
    overscanStopIndex: overscanStopIndex
  }
}

export default ColorWallSwatchList
