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
import type { ColorCollectionDetail, Color } from '../../shared/types/Colors'

const GRID_AUTOSCROLL_SPEED: number = 300

type Props = {
  collectionDetailData: ColorCollectionDetail,
  addToLivePalette: Function
}

type Ref = RefObject

const cwProviderValues = {
  displayDetailsLink: false,
  displayInfoButton: true,
  displayAddButton: true
}

const baseClass = 'collection-detail'
const wrapper = `${baseClass}__wrapper`
const collectionInfo = `${baseClass}__info`
const collectionCover = `${baseClass}__cover`
const collectionDescription = `${baseClass}__description`
const collectionLearnMore = `${baseClass}__learn-more`
const collectionColorList = `${baseClass}__color-list`
const collectionColorListVertical = `${baseClass}__color-list-vertical`
const collectionVerticalControls = `${baseClass}__vertical-controls`
const verticalControlsTrigger = `${baseClass}__trigger`
const triggerPrevious = `${baseClass}__previous-trigger`
const triggerNext = `${baseClass}__next-trigger`

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

export const CollectionDetail = (props: Props) => {
  const resultSwatchSize = 175
  const { addToLivePalette, collectionDetailData } = props
  const _gridWrapperRef: ?Ref = useRef(null)

  return (
    <div className={`${wrapper}`}>
      <div className={`${collectionInfo}`}>
        <img className={`${collectionCover}`} alt='' src={`${collectionDetailData.img}`} />
        <div className={`${collectionDescription}`}>{collectionDetailData.name}</div>
        <a href='https://' className={`${collectionLearnMore}`}>LEARN MORE ABOUT THIS COLLECTION</a>
      </div>
      <div className={`${collectionColorList}`}>
        <div ref={_gridWrapperRef} className={`${collectionColorListVertical}`}>
          <AutoSizer onResize={handleGridResize}>
            {({ height, width }) => {
              const columnCount = Math.max(1, Math.round(width / resultSwatchSize))
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
                  addToLivePalette={addToLivePalette}
                />
              )
            }}
          </AutoSizer>
        </div>
        <div className={`${collectionVerticalControls}`}>
          <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'top', _gridHeight, _cellSize)} className={`${verticalControlsTrigger} ${triggerPrevious}`}>
            <FontAwesomeIcon className={``} icon={['fa', 'angle-up']} />
          </div>
          <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'bottom', _gridHeight, _cellSize)} className={`${verticalControlsTrigger} ${triggerNext}`}>
            <FontAwesomeIcon className={``} icon={['fa', 'angle-down']} />
          </div>
        </div>
      </div>
    </div>
  )
}

function verticalScroll (_gridWrapperRef, direction, _gridHeight, _cellSize) {
  if (_gridWrapperRef && _gridWrapperRef.current) {
    const gridEl = _gridWrapperRef.current.querySelector('.ReactVirtualized__Grid')

    let scrollToY = 0
    if (gridEl && gridEl.scrollTop) {
      scrollToY = gridEl.scrollTop
    }

    if (direction === 'bottom') {
      scrollToY += _cellSize
    } else {
      scrollToY -= _cellSize
    }
    scroll.top(gridEl, scrollToY, { duration: GRID_AUTOSCROLL_SPEED })
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export {
  collectionCover,
  collectionDescription,
  triggerPrevious,
  triggerNext
}
export default connect(null, mapDispatchToProps)(CollectionDetail)
