// @flow
import { useRouteMatch, Link } from 'react-router-dom'
import React, { useContext, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl, FormattedMessage } from 'react-intl'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import flattenDeep from 'lodash/flattenDeep'
import { emitColor, makeActiveColorById, filterBySection, filterByFamily } from '../../../store/actions/loadColors'
import { type ColorsState } from 'src/shared/types/Actions.js.flow'
import { add } from '../../../store/actions/live-palette'
import { varValues } from 'src/shared/variableDefs'
import { convertToSpacedGrid } from '../../../shared/helpers/ColorDataUtils'
import { generateColorWallPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { ROUTE_PARAMS } from 'constants/globals'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import GenericMessage from '../../Messages/GenericMessage'
import ColorWallSwatchList from './ColorWallSwatchList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ColorWallContext from './ColorWallContext'
import ColorWallProp from './ColorWallProp/ColorWallProp'
import './ColorWall.scss'

type Props = { contain: boolean }

const EMPTY_COLOR_GRID = [[]]

const ColorWall = (props: Props) => {
  const { contain = false } = props
  const { colorWall, swatchShouldEmit } = useContext(ConfigurationContext)
  const { swatchMinSize, swatchMaxSize, swatchMinSizeZoomed, swatchMaxSizeZoomed, colorWallBgColor } = useContext(ColorWallContext)
  const {
    colorWallActive,
    items: { colorMap, colors, unorderedColors, colorStatuses, sectionLabels },
    section: reduxSection,
    family: reduxFamily,
    layout
  }: ColorsState = useSelector(state => state.colors)
  const { messages = {} } = useIntl()
  const dispatch = useDispatch()
  const { url, params: { section, family, colorId, colorName } } = useRouteMatch()
  const trueFamily = reduxFamily || family
  const trueSection = reduxSection || section

  const colorsGrid = useMemo(() => {
    return layout ? convertToSpacedGrid(layout, sectionLabels[reduxSection]) : EMPTY_COLOR_GRID
  }, [layout, reduxSection, sectionLabels])

  const swatchListKey = useMemo(() => {
    return flattenDeep(colorsGrid).join(',')
  }, [colorsGrid])

  const swatchLinkGeneratorFunc = useMemo(() => {
    return (props) => {
      if (!props) {
        return ''
      }
      const { id, brandKey, colorNumber, name } = props
      const linkUrl = generateColorWallPageUrl(trueSection, trueFamily, id, fullColorName(brandKey, colorNumber, name))
      return linkUrl + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : '')
    }
  }, [trueSection, trueFamily, url])

  const onAddColor = useMemo(() => {
    return color => dispatch(swatchShouldEmit ? emitColor(color) : add(color))
  }, [swatchShouldEmit])

  useEffect(() => { dispatch(filterBySection(section)) }, [section])
  useEffect(() => { dispatch(filterByFamily(family)) }, [family])
  useEffect(() => { dispatch(makeActiveColorById(colorId)) }, [colorId])

  const zoomOutUrl = useMemo(() => {
    // zooming out is the UI result of just removing the selected color from the route
    return url.replace(`/${ROUTE_PARAMS.COLOR}/${colorId}/${colorName}`, '')
  }, [colorId, colorName])

  return (
    <TransitionGroup className='sw-colorwall color-wall-zoom-transitioner'>
      <CSSTransition
        key={colorWallActive ? 'active' : ''}
        timeout={varValues.colorWall.transitionTime}
        unmountOnExit
        mountOnEnter
        classNames={`color-wall-zoom-transitioner__zoom-${colorWallActive ? 'in' : 'out'} color-wall-zoom-transitioner__zoom-${colorWallActive ? 'in' : 'out'}-`}
      >
        {(colors || unorderedColors)
          ? <div className='color-wall-wall' style={{ backgroundColor: colorWallBgColor }}>
            <ColorWallProp />
            <ColorWallSwatchList
              activeColor={colorWallActive}
              bloomRadius={colorWall.bloomRadius} // TODO: demo purposes, maybe we want to change this
              colorMap={colorMap}
              colors={colorsGrid}
              colorStatuses={colorStatuses}
              contain={contain}
              family={reduxFamily}
              immediateSelectionOnActivation={!colorWallActive}
              key={swatchListKey}
              maxCellSize={colorWallActive ? swatchMaxSizeZoomed : swatchMaxSize}
              minCellSize={colorWallActive ? swatchMinSizeZoomed : swatchMinSize}
              onAddColor={onAddColor}
              section={reduxSection}
              showAll={!colorWallActive}
              swatchLinkGenerator={swatchLinkGeneratorFunc}
              zoomOutUrl={zoomOutUrl}
            />
            {colorWallActive ? (
              <div className='color-wall-wall__btns'>
                <Link
                  to={zoomOutUrl}
                  className='color-wall-wall__btns__btn'
                  title={messages.ZOOM_OUT}
                >
                  <FontAwesomeIcon icon='search-minus' size='lg' />
                  <span className='visually-hidden'><FormattedMessage id='ZOOM_OUT' /></span>
                </Link>
              </div>
            ) : null}
          </div>
          : <GenericMessage type={GenericMessage.TYPES.ERROR}>
            <FormattedMessage id='NO_COLORS_AVAILABLE' />
          </GenericMessage>
        }
      </CSSTransition>
    </TransitionGroup>
  )
}

export default ColorWall
