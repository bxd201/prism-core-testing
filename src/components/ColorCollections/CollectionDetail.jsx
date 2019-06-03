// @flow
import React, { useRef } from 'react'
import { connect } from 'react-redux'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import ColorWallSwatch from '../Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import ColorWallContext from '../Facets/ColorWall/ColorWallContext'
import { add } from '../../store/actions/live-palette'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as scroll from 'scroll'
import './CollectionDetail.scss'

const GRID_AUTOSCROLL_SPEED: number = 300

type Props = {
  collectionDetailData: ColorCollectionDetail,
  addToLivePalette: Function
}

const cwProviderValues = {
  displayDetailsLink: false,
  displayInfoButton: true,
  displayAddButton: true
}

const baseClass = 'collection-detail'

function cellRenderer ({
  columnIndex, // Horizontal (column) index of cell
  isScrolling, // The Grid is currently being scrolled
  isVisible, // This cell is visible within the grid (eg it is not an overscanned cell)
  key, // Unique key within array of cells
  parent, // Reference to the parent Grid (instance)
  rowIndex, // Vertical (row) index of cell
  style // Style object to be applied to cell (to position it)
}: Object) {
  const { props: { columnCount, addToLivePalette, colors } } = parent
  const index = columnIndex + (rowIndex * columnCount)

  if (colors && colors[index]) {
    const thisColor: Color = colors[index]

    return (
      <div key={key} style={style}>
        <ColorWallContext.Provider value={cwProviderValues}>
          <ColorWallSwatch
            key={thisColor.hex}
            showContents
            color={thisColor}
            onAdd={addToLivePalette}
          />
        </ColorWallContext.Provider>
      </div>
    )
  }

  return null
}

let _gridHeight = 0
let _cellSize = 0
function handleGridResize ({ width, height }) {
  _gridHeight = height
}

const CollectionDetail = (props: Props) => {
  const resultSwatchSize = 175
  const { addToLivePalette, collectionDetailData } = props
  const _gridWrapperRef = useRef(null)

  return (
    <div className={`${baseClass}__wrapper`}>
      <div className={`${baseClass}__info`}>
        <img className={`${baseClass}__cover`} alt='' src={`${collectionDetailData.img}`} />
        <div className={`${baseClass}__description`}>{collectionDetailData.name}</div>
        <a href='https://' className={`${baseClass}__learn-more`}>LEARN MORE ABOUT THIS COLLECTION</a>
      </div>
      <div className={`${baseClass}__color-list`}>
        <div ref={_gridWrapperRef} className={`${baseClass}__color-list-vertical`}>
          <AutoSizer onResize={handleGridResize}>
            {({ height, width }) => {
              const columnCount = Math.round(width / resultSwatchSize)
              const rowCount = Math.ceil(collectionDetailData.collections.length / columnCount)
              const newSize = width / columnCount
              _cellSize = newSize
              return (
                <Grid
                  colors={collectionDetailData.collections}
                  cellRenderer={cellRenderer}
                  columnWidth={newSize}
                  columnCount={columnCount}
                  height={height}
                  rowHeight={newSize}
                  rowCount={rowCount}
                  width={width}
                  id={`container`}
                  addToLivePalette={addToLivePalette}
                />
              )
            }}
          </AutoSizer>
        </div>
        <div className={`${baseClass}__vertical-controls`}>
          <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'top', _gridHeight, _cellSize)} className={`${baseClass}__trigger ${baseClass}__previous-trigger`}>
            <FontAwesomeIcon className={``} icon={['fa', 'angle-up']} />
          </div>
          <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'bottom', _gridHeight, _cellSize)} className={`${baseClass}__trigger ${baseClass}__next-trigger`}>
            <FontAwesomeIcon className={``} icon={['fa', 'angle-down']} />
          </div>
        </div>
      </div>
    </div>
  )
}

function verticalScroll (_gridWrapperRef, direction, _gridHeight, _cellSize) {
  const gridEl = _gridWrapperRef.current.querySelector('.ReactVirtualized__Grid')

  let scrollToY = gridEl.scrollTop

  if (direction === 'bottom') {
    scrollToY += _cellSize
  } else {
    scrollToY -= _cellSize
  }
  scroll.top(gridEl, scrollToY, { duration: GRID_AUTOSCROLL_SPEED })
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(CollectionDetail)
