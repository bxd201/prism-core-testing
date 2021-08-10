// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { Grid, AutoSizer } from 'react-virtualized'
import ColorSwatch from 'src/components/Facets/ColorWall/ColorSwatch/ColorSwatch'
import ColorWallContext, { colorWallContextDefault } from '../Facets/ColorWall/ColorWallContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'
import * as scroll from 'scroll'
import './CollectionDetail.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'
import type { ColorCollectionDetail } from '../../shared/types/Colors.js.flow'

const GRID_AUTOSCROLL_SPEED: number = 300

const baseClass = 'collection-detail'
const wrapper = `${baseClass}__wrapper`
const collectionInfo = `${baseClass}__info`
const collectionCover = `${baseClass}__cover`
const collectionDescription = `${baseClass}__description`
const collectionColorList = `${baseClass}__color-list`
const collectionColorListVertical = `${baseClass}__color-list-vertical`
const verticalControlsTrigger = `${baseClass}__trigger`
const triggerPrevious = `${baseClass}__previous-trigger`
const triggerNext = `${baseClass}__next-trigger`

type Props = { collectionDetailData: ColorCollectionDetail, addToLivePalette: Function }
const CollectionDetail = ({ addToLivePalette, collectionDetailData }: Props) => {
  const { cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { colorCollections = {} } = cvw
  const { scrollArrows: showScrollArrows = true } = colorCollections
  const [showTopScrollControl, setShowTopScrollControl] = useState<boolean>(false)
  const [showBottomScrollControl, setShowBottomScrollControl] = useState<boolean>(false)
  const [gridHeight, setGridHeight] = useState<number>(0)
  const _gridWrapperRef: ?RefObject = useRef(null)
  const resultSwatchSize = 175
  let _cellSize = 0

  useEffect(() => {
    if (_gridWrapperRef) {
      const grid = _gridWrapperRef.current.querySelector('.ReactVirtualized__Grid')
      setShowBottomScrollControl(grid.scrollHeight > grid.offsetHeight)
    }
  }, [gridHeight])

  const handleGridResize = ({ width, height }) => { setGridHeight(height) }

  const cellRenderer = ({ columnIndex, isScrolling, isVisible, key, parent, rowIndex, style }) => {
    const { columnCount, colors } = parent.props
    const index = columnIndex + (rowIndex * columnCount)
    const pctW = 100 / columnCount

    const _style = {
      ...style,
      width: `${pctW}%`,
      left: `${pctW * columnIndex}%`
    }
    return colors && colors[index] && <ColorSwatch key={key} style={_style} color={colors[index]} showContents outline />
  }

  const verticalScroll = (_gridWrapperRef, direction, gridHeight, _cellSize) => {
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

      setShowTopScrollControl(scrollToY > 0)
      setShowBottomScrollControl((scrollToY + gridEl.clientHeight) < gridEl.scrollHeight)
    }
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
                    autoContainerWidth
                    addToLivePalette={addToLivePalette}
                  />
                )
              }}
            </AutoSizer>
          </div>
          {showScrollArrows && <>
            {showTopScrollControl && <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'top', gridHeight, _cellSize)} className={`${verticalControlsTrigger} ${triggerPrevious}`}>
              <FontAwesomeIcon className={``} icon={['fa', 'angle-up']} />
            </div>}
            {showBottomScrollControl && <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'bottom', gridHeight, _cellSize)} className={`${verticalControlsTrigger} ${triggerNext}`}>
              <FontAwesomeIcon className={``} icon={['fa', 'angle-down']} />
            </div>}
          </>}
        </div>
      </div>
    </ColorWallContext.Provider>
  )
}

export { collectionCover, collectionDescription, triggerPrevious, triggerNext }
export default CollectionDetail
