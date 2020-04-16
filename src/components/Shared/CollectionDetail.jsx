// @flow
import React, { useRef } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import ColorSwatch from 'src/components/Facets/ColorWall/ColorSwatch/ColorSwatch'
import ColorWallContext, { colorWallContextDefault } from '../Facets/ColorWall/ColorWallContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import * as scroll from 'scroll'
import './CollectionDetail.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import type { ColorCollectionDetail } from '../../shared/types/Colors.js.flow'

const GRID_AUTOSCROLL_SPEED: number = 300

type Ref = RefObject

const baseClass = 'collection-detail'
const wrapper = `${baseClass}__wrapper`
const collectionInfo = `${baseClass}__info`
const collectionCover = `${baseClass}__cover`
const collectionDescription = `${baseClass}__description`
const collectionColorList = `${baseClass}__color-list`
const collectionColorListVertical = `${baseClass}__color-list-vertical`
const collectionVerticalControls = `${baseClass}__vertical-controls`
const verticalControlsTrigger = `${baseClass}__trigger`
const triggerPrevious = `${baseClass}__previous-trigger`
const triggerNext = `${baseClass}__next-trigger`

let _gridHeight = 0
let _cellSize = 0
function handleGridResize ({ width, height }) {
  _gridHeight = height
}

type Props = { collectionDetailData: ColorCollectionDetail, addToLivePalette: Function }
export const CollectionDetail = ({ addToLivePalette, collectionDetailData }: Props) => {
  const _gridWrapperRef: ?Ref = useRef(null)
  const resultSwatchSize = 175

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
    const { columnCount, colors } = parent.props
    const index = columnIndex + (rowIndex * columnCount)
    return colors && colors[index] && <ColorSwatch key={key} style={style} color={colors[index]} showContents />
  }

  return (
    <ColorWallContext.Provider value={{ ...colorWallContextDefault, displayDetailsLink: false, displayInfoButton: true, displayAddButton: true }}>
      <div className={`${wrapper}`}>
        <div className={`${collectionInfo}`}>
          <img className={`${collectionCover}`} alt='' src={`${collectionDetailData.img}`} />
          <div className={`${collectionDescription}`}>{collectionDetailData.description}</div>
        </div>
        <div className={`${collectionColorList}`}>
          <div ref={_gridWrapperRef} className={`${collectionColorListVertical}`}>
            <AutoSizer onResize={handleGridResize}>
              {({ height, width }) => {
                const collectionSize = collectionDetailData.collections.length
                const columnCount = Math.max(1, Math.round(width / resultSwatchSize))
                const rowCount = Math.ceil(collectionSize / columnCount)
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
    </ColorWallContext.Provider>
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

export { collectionCover, collectionDescription, triggerPrevious, triggerNext }
export default CollectionDetail
