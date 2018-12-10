// @flow
import React, { PureComponent } from 'react'
import { chunk, fill } from 'lodash'
// $FlowIgnore
import { Grid, AutoSizer } from 'react-virtualized'

import { varValues } from 'variables'
import ZoomTransitioner, { type ZoomPositionerProps, TransitionModes } from './ZoomTransitioner/ZoomTransitioner'
import ColorWallSwatch from './ColorWallSwatch/ColorWallSwatch'
import ColorWallSwatchUI from './ColorWallSwatch/ColorWallSwatchUI'
import ColorWallSwatchRenderer from './ColorWallSwatch/ColorWallSwatchRenderer'
import { type Color } from '../../../shared/types/Colors'
import { getColorCoords, drawCircle } from './ColorWallUtils'
import { ZOOMED_VIEW_GRID_PADDING } from './ColorWallProps'

type Props = {
  colors: Array<Color>, // eslint-disable-line react/no-unused-prop-types
  cellSize: number,
  bloomRadius: number,
  showAll?: boolean,
  immediateSelectionOnActivation?: boolean,
  onAddColor?: Function,
  onActivateColor?: Function,
  initialActiveColor?: Color // eslint-disable-line react/no-unused-prop-types
}

type ColorReference = {
  level: number,
  offsetX?: number,
  offsetY?: number,
  compensateX?: Function,
  compensateY?: Function
}

type State = {
  activeCoords: number[],
  focusCoords: number[],
  colorHash: {
    [ key: number ]: Color
  },
  levelHash: {
    [ key: number ]: ColorReference
  },
  colorIdGrid: number[][],
  zoomingIn: boolean,
  zoomingOut: boolean,
  activeColor?: Color,
  zoomerInitProps?: ZoomPositionerProps
}

class ColorWallSwatchList extends PureComponent<Props, State> {
  _DOMNode = void (0)
  _scrollTimeout = void (0)
  _initialFocusCoords = void (0)
  _gridWidth: number = 0
  _gridHeight: number = 0

  state: State = {
    activeCoords: [],
    activeColor: void (0),
    focusCoords: [],
    colorHash: {},
    levelHash: {},
    colorIdGrid: [[]],
    zoomingIn: false,
    zoomingOut: false
  }

  static defaultProps = {
    bloomRadius: 0
  }

  constructor (props: Props) {
    super(props)

    const { colors, initialActiveColor, showAll } = props

    this.activateColor = this.activateColor.bind(this)
    this.addColor = this.addColor.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleGridResize = this.handleGridResize.bind(this)

    let colorHash: Object = {}
    colors.forEach((color: Color) => {
      colorHash[color.id] = color
    })

    let colorIdGrid: number[][] = chunk(colors.map(color => color.id), varValues.colorWall.swatchColumns)

    if (!showAll) {
      const colCount = colorIdGrid[0].length

      for (let i = ZOOMED_VIEW_GRID_PADDING; i > 0; i--) {
        colorIdGrid.unshift(fill(new Array(colCount), 0))
        colorIdGrid.push(fill(new Array(colCount), 0))
        colorIdGrid = colorIdGrid.map(col => {
          col.unshift(0)
          col.push(0)
          return col
        })
      }
    }

    this.state.colorIdGrid = colorIdGrid
    this.state.colorHash = colorHash

    if (initialActiveColor) {
      const moreState = this.updateActiveColor(initialActiveColor, true)

      if (moreState) {
        Object.assign(this.state, moreState)

        this._initialFocusCoords = moreState.focusCoords
      }
    }
  }

  updateActiveColor (color?: Color, calculateLevels?: boolean) {
    const { bloomRadius } = this.props
    const { colorIdGrid } = this.state

    if (!color) {
      return
    }

    let stateChanges: {
      activeColor: Color,
      activeCoords: number[],
      focusCoords: number[],
      levelHash?: {
        [ key: number]: ColorReference
      }
    }
    const coords = getColorCoords(color.id, colorIdGrid)

    if (coords) {
      const centerX = coords[0]
      const centerY = coords[1]

      stateChanges = {
        activeColor: color,
        activeCoords: [ centerX, centerY ],
        focusCoords: [ centerX, centerY ]
      }

      if (calculateLevels) {
        stateChanges.levelHash = drawCircle(bloomRadius, centerX, centerY, colorIdGrid)
      }

      return stateChanges
    }
  }

  addColor = function addColor (newColor: Color) {
    const { onAddColor } = this.props

    if (onAddColor) {
      onAddColor(newColor)
    }
  }

  activateColor = function activateColor (newColor: Color) {
    const activeSwatchId = newColor.id
    const { onActivateColor, immediateSelectionOnActivation } = this.props
    const { activeColor } = this.state

    if (activeSwatchId) {
      const newState = this.updateActiveColor(newColor, !immediateSelectionOnActivation)

      if (!immediateSelectionOnActivation) {
        this.setState(newState, () => {
          if (onActivateColor) {
            /// ... call it now
            onActivateColor(activeColor)
          }
        })
      } else {
        this.setState(newState, this.zoomInActivate)
      }
    }
  }

  zoomInActivate () {
    const { onActivateColor, cellSize } = this.props
    const { activeCoords, colorIdGrid, activeColor } = this.state

    const numRows = colorIdGrid.length
    const numCols = colorIdGrid[0].length
    const cellSizeShowAll = this._gridWidth / numCols
    const cellSizeRatio = cellSizeShowAll / cellSize
    const cellsTotalH = numRows * cellSizeShowAll
    const cellsTotalW = numCols * cellSizeShowAll
    const zoomerW = this._gridWidth * cellSizeRatio
    const zoomerH = this._gridHeight * cellSizeRatio
    const scale = zoomerW / this._gridWidth

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

    let zoomerX = Math.max(zoomerW / 2, Math.min(activePos[0], cellsTotalW - (zoomerW / 2))) - (this._gridWidth / 2)
    let zoomerY = Math.max(zoomerH / 2, Math.min(activePos[1], cellsTotalH - (zoomerH / 2))) - (this._gridHeight / 2)

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
          /// ... call it now
          onActivateColor(activeColor)
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
    const { colorHash, levelHash, colorIdGrid } = this.state
    const { immediateSelectionOnActivation } = this.props

    const rowCount = colorIdGrid.length
    const columnCount = colorIdGrid[0].length
    const colorId = colorIdGrid[rowIndex][columnIndex]

    if (!colorId) {
      return null
    }

    const color: Color = colorHash[colorId]
    const thisLevel: ColorReference = levelHash[colorId]

    let edgeProps = {}

    if (columnIndex === 0) {
      edgeProps.leftCol = true
    }

    if (rowIndex === 0) {
      edgeProps.topRow = true
    }

    if (columnIndex === columnCount - 1) {
      edgeProps.rightCol = true
    }

    if (rowIndex === rowCount - 1) {
      edgeProps.bottomRow = true
    }

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
          <ColorWallSwatch onEngage={this.activateColor} onAdd={this.addColor} color={color} level={thisLevel.level}
            offsetX={thisLevel.offsetX} offsetY={thisLevel.offsetY}
            {...edgeProps} />
        ) : isScrolling ? ( // all non-bloomed swatches when scrolling, the least complicated swatch option
          <ColorWallSwatchRenderer aria-colindex={columnIndex} aria-rowindex={rowIndex} color={color.hex} />
        ) : immediateSelectionOnActivation ? ( // a color swatch that behaves as a button and that's it
          <ColorWallSwatchUI color={color} onEngage={this.activateColor} {...edgeProps} />
        ) : ( // a normal color swatch that behaves as a button and also is able to be visually activated (not just behave like a button)... a bloomable swatch, basically
          <ColorWallSwatch onEngage={this.activateColor} color={color} {...edgeProps} />
        )}
      </div>
    )
  }

  handleKeyDown = function handleKeyDown (e: KeyboardEvent) {
    const { colorIdGrid, focusCoords } = this.state
    const rowCount = colorIdGrid.length
    const columnCount = colorIdGrid[0].length

    let x = focusCoords[0]
    let y = focusCoords[1]

    switch (e.charCode) {
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
    }
  }

  handleGridResize = function handleGridResize (dims: { width: number, height: number }) {
    this._gridHeight = dims.height
    this._gridWidth = dims.width
  }

  render () {
    const { cellSize, showAll } = this.props
    const { colorIdGrid, levelHash, zoomingIn, zoomerInitProps } = this.state
    const rowCount = colorIdGrid.length
    const columnCount = colorIdGrid[0].length
    let addlGridProps = {}
    let transitioner = null

    if (this._initialFocusCoords) {
      addlGridProps.scrollToColumn = this._initialFocusCoords[0]
      addlGridProps.scrollToRow = this._initialFocusCoords[1]
      this._initialFocusCoords = void (0)
    }

    if (zoomingIn && zoomerInitProps) {
      transitioner = <ZoomTransitioner position={zoomerInitProps} mode={TransitionModes.ZOOM_IN} />
    }

    // TODO: kind of janky, but temporarily fixing the bug where on initial click there is no active color selected
    if (this._initialActiveColor) {
      this.activateColor(this._initialActiveColor)
      this._initialActiveColor = void (0)

      return null
    }

    return (
      <div className={`color-wall-swatch-list ${!showAll ? 'color-wall-swatch-list--zoomed' : 'color-wall-swatch-list--show-all'}`}
        onKeyDown={this.handleKeyDown}
        ref={el => { this._DOMNode = el }}>

        {transitioner}

        <AutoSizer onResize={this.handleGridResize}>
          {({ height, width }) => {
            let size = cellSize

            if (showAll) {
              size = Math.min(width / columnCount, cellSize)
            }

            return (
              <Grid
                _forceUpdateProp={levelHash}
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
    const { cellSize, showAll } = this.props
    const { activeCoords, focusCoords } = this.state
    const { activeCoords: oldActiveCoords, focusCoords: oldFocusCoords } = prevState

    if (showAll) {
      return
    }

    let oldX = 0
    let oldY = 0
    let newX = 0
    let newY = 0

    if (focusCoords.length) {
      newX = focusCoords[0]
      newY = focusCoords[1]
    } else if (activeCoords.length) {
      newX = activeCoords[0]
      newY = activeCoords[1]
    }

    if (oldFocusCoords.length) {
      oldX = oldFocusCoords[0]
      oldY = oldFocusCoords[1]
    } else if (oldActiveCoords.length) {
      oldX = oldActiveCoords[0]
      oldY = oldActiveCoords[1]
    }

    if (this._DOMNode && (oldX !== newX || oldY !== newY)) {
      const gridEl = this._DOMNode.querySelector('.ReactVirtualized__Grid')

      if (gridEl) {
        clearTimeout(this._scrollTimeout)
        this._scrollTimeout = setTimeout(() => {
          // $FlowIgnore -- flow doesn't think this exists, but it is mistaken
          gridEl.scrollTo({
            left: newX * cellSize - (this._gridWidth - cellSize) / 2,
            top: newY * cellSize - (this._gridHeight - cellSize) / 2,
            behavior: 'smooth'
          })
        }, 200)
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
