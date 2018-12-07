// @flow
import React, { PureComponent } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'

import { varValues } from 'variables'
import ZoomTransitioner, { type ZoomPositionerProps, TransitionModes } from './ZoomTransitioner/ZoomTransitioner'
import ColorWallSwatch from './ColorWallSwatch/ColorWallSwatch'
import ColorWallSwatchUI from './ColorWallSwatch/ColorWallSwatchUI'
import ColorWallSwatchRenderer from './ColorWallSwatch/ColorWallSwatchRenderer'
import type { ColorMap, Color, ColorGrid, ColorIdGrid, ProbablyColor } from '../../../shared/types/Colors'
import { getColorCoords, drawCircle, getCoordsObjectFromPairs } from './ColorWallUtils'

type Props = {
  colors: ColorGrid, // eslint-disable-line react/no-unused-prop-types
  cellSize: number,
  bloomRadius: number,
  colorMap: ColorMap,
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

type State = {
  activeCoords: number[],
  focusCoords: number[],
  levelMap: {
    [ key: string ]: ColorReference
  },
  colorIdGrid: ColorIdGrid,
  zoomingIn: boolean,
  zoomingOut: boolean,
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
    focusCoords: [],
    levelMap: {},
    colorIdGrid: [[]],
    zoomingIn: false,
    zoomingOut: false
  }

  static defaultProps = {
    bloomRadius: 0
  }

  constructor (props: Props) {
    super(props)

    const { colors, activeColor } = props

    this.activateColor = this.activateColor.bind(this)
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

    if (activeColor) {
      const moreState = this.updateActiveColor(activeColor, true)

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
      activeCoords: number[],
      focusCoords: number[],
      levelMap?: {
        [ key: string]: ColorReference
      }
    }
    const coords = getColorCoords(color.id, colorIdGrid)

    if (coords) {
      const centerX = coords[0]
      const centerY = coords[1]

      stateChanges = {
        activeCoords: [ centerX, centerY ],
        focusCoords: [ centerX, centerY ]
      }

      if (calculateLevels) {
        stateChanges.levelMap = drawCircle(bloomRadius, centerX, centerY, colorIdGrid)
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

    if (activeSwatchId) {
      const newState = this.updateActiveColor(newColor, !immediateSelectionOnActivation)

      if (!immediateSelectionOnActivation) {
        this.setState(newState, () => {
          if (onActivateColor) {
            /// ... call it now
            onActivateColor(newColor)
          }
        })
      } else {
        this.setState(newState, () => {
          this.zoomInActivate(newColor)
        })
      }
    }
  }

  zoomInActivate (newColor: Color) {
    const { onActivateColor, cellSize } = this.props
    const { activeCoords, colorIdGrid } = this.state

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
    const { colorMap, immediateSelectionOnActivation, onAddColor } = this.props

    const rowCount = colorIdGrid.length
    const columnCount = colorIdGrid[0].length
    const colorId = colorIdGrid[rowIndex][columnIndex]

    if (!colorId) {
      return null
    }

    const color: Color = colorMap[colorId]
    const thisLevel: ColorReference = levelMap[colorId]

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
          <ColorWallSwatch showContents={thisLevel.level === 0} onEngage={this.activateColor} onAdd={onAddColor ? this.addColor : void (0)} color={color} level={thisLevel.level}
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
    const { colorIdGrid, levelMap, zoomingIn, zoomerInitProps } = this.state
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
                _forceUpdateProp={levelMap}
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
        clearTimeout(this._scrollTimeout)
        this._scrollTimeout = setTimeout(() => {
          // $FlowIgnore -- flow doesn't think this exists, but it is mistaken
          gridEl.scrollTo({
            left: newCoords.x * cellSize - (this._gridWidth - cellSize) / 2,
            top: newCoords.y * cellSize - (this._gridHeight - cellSize) / 2,
            behavior: 'smooth'
          })
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
