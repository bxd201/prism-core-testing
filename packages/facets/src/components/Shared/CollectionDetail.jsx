// @flow
import React, { useContext, useEffect, useRef, useState } from 'react'
// $FlowIgnore -- no defs for react-virtualized
import { AutoSizer,Grid } from 'react-virtualized'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Prism, { ColorSwatch } from '@prism/toolkit'
import * as scroll from 'scroll'
import { varValues } from 'src/shared/withBuild/variableDefs'
import 'src/providers/fontawesome/fontawesome'
import ConfigurationContext, { type ConfigurationContextType } from '../../contexts/ConfigurationContext/ConfigurationContext'
import type { ColorCollectionDetail } from '../../shared/types/Colors.js.flow'
import { colorSwatchCommonProps } from '../ColorSwatchContent/ColorSwatchContent'
import ColorWallContext, { colorWallContextDefault } from '../Facets/ColorWall/ColorWallContext'
import './CollectionDetail.scss'
import '../ColorSwatchContent/ColorSwatchContent.scss'
import 'src/scss/externalComponentSupport/AutoSizer.scss'

const GRID_AUTOSCROLL_SPEED: number = 300

const baseClass = 'collection-detail'
const wrapper = `${baseClass}__wrapper`
const collectionInfo = `${baseClass}__info`
const collectionCover = `${baseClass}__cover`
const collectionDescription = `${baseClass}__description`
const collectionDiv = `${baseClass}__border`
const collectionButton = `${baseClass}__button`
const collectionColorList = `${baseClass}__color-list`
const collectionColorListVertical = `${baseClass}__color-list-vertical`
const verticalControlsTrigger = `${baseClass}__trigger`
const triggerPrevious = `${baseClass}__previous-trigger`
const triggerNext = `${baseClass}__next-trigger`

type Props = { collectionDetailData: ColorCollectionDetail, addToLivePalette: Function }
const CollectionDetail = ({ addToLivePalette, collectionDetailData }: Props) => {
  const { brandKeyNumberSeparator, colorWall: { colorSwatch = {} }, cvw = {} } = useContext<ConfigurationContextType>(ConfigurationContext)
  const { houseShaped = false } = colorSwatch
  const { colorCollections = {} } = cvw
  const { scrollArrows: showScrollArrows = true, showDescriptionMobile = false } = colorCollections
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
    const color = colors && colors[index]
    const swatchClass = houseShaped ? 'collection-detail--house-shaped' : 'swatch-content'
    const pctW = 100 / columnCount
    const _style = houseShaped
      ? { ...style, width: `calc(${pctW}% - 10px)`, left: `${pctW * columnIndex}%`, padding: '5px' }
      : { ...style, width: `${pctW}%`, left: `${pctW * columnIndex}%` }

    return color && <Prism key={key}>
      <ColorSwatch
        {...colorSwatchCommonProps({ brandKeyNumberSeparator, color })}
        className={swatchClass}
        style={_style}
      />
    </Prism>
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

  // Supplement needed to handle CBG HGTV cvw pdf storage by url host environment (develop / qa / prod)
  // TODO: abstract this logic further up the chain
  const getEnvUrl = url => {
    const splitUrl = url.split('//')
    const hostEnv = window.location.hostname.split('-')[0]

    if (splitUrl[0].startsWith('h')) {
      splitUrl.splice(1, 0, `//${(hostEnv === 'develop' || hostEnv === 'qa') ? `${hostEnv}-` : ''}`)
    }

    return splitUrl.join('')
  }

  return (
    <ColorWallContext.Provider value={{ ...colorWallContextDefault, displayDetailsLink: false, displayInfoButton: true, displayAddButton: true }}>
      <div className={`${wrapper}`}>
        <div className={`${collectionInfo}`}>
          <img className={`${collectionCover}${showDescriptionMobile ? '' : ` ${collectionCover}--hidden-mobile`}`} alt='' src={`${collectionDetailData.coverUrl}`} />
          <div className={`${collectionDescription}${showDescriptionMobile ? '' : ` ${collectionDescription}--hidden-mobile`}`}>{collectionDetailData.description}</div>
          {collectionDetailData.pdfUrl
            ? <div className={`${collectionDiv}`}>
              <a className={`${collectionButton}`} href={getEnvUrl(collectionDetailData.pdfUrl)} target='_blank'>
                Download PDF
              </a>
            </div>
            : null}
        </div>
        <div className={`${collectionColorList}`} style={houseShaped ? { height: '630px' } : {}}>
          <div ref={_gridWrapperRef} className={`${collectionColorListVertical}`}>
            <AutoSizer onResize={handleGridResize}>
              {({ height, width }) => {
                const collectionSize = collectionDetailData.collections.length
                const columnCount = window.innerWidth < varValues.breakpoints.xs.slice(0, -2) ? houseShaped ? 2 : 3 : Math.max(1, Math.round(width / resultSwatchSize))
                const newSize = width / columnCount
                const rowCount = Math.ceil(collectionSize / columnCount)
                const rowHeight = houseShaped ? 260 : newSize
                _cellSize = newSize

                return (
                  <Grid
                    colors={collectionDetailData.collections}
                    cellRenderer={cellRenderer}
                    columnWidth={newSize}
                    columnCount={columnCount}
                    height={height}
                    rowHeight={rowHeight}
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
              <FontAwesomeIcon className={''} icon={['fa', 'angle-up']} />
            </div>}
            {showBottomScrollControl && <div role='presentation' onClick={() => verticalScroll(_gridWrapperRef, 'bottom', gridHeight, _cellSize)} className={`${verticalControlsTrigger} ${triggerNext}`}>
              <FontAwesomeIcon className={''} icon={['fa', 'angle-down']} />
            </div>}
          </>}
        </div>
      </div>
    </ColorWallContext.Provider>
  )
}

export { collectionCover, collectionDescription, triggerNext,triggerPrevious }
export default CollectionDetail
