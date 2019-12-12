// @flow
import { useRouteMatch, Link } from 'react-router-dom'
import React, { useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl, FormattedMessage } from 'react-intl'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import memoizee from 'memoizee'
import { emitColor, makeActiveColorById, filterBySection, filterByFamily } from '../../../store/actions/loadColors'
import { add } from '../../../store/actions/live-palette'
import { varValues } from 'variables'
import { compareKebabs } from '../../../shared/helpers/StringUtils'
import { convertCategorizedColorsToGrid } from '../../../shared/helpers/ColorDataUtils'
import { generateColorWallPageUrl, fullColorName } from '../../../shared/helpers/ColorUtils'
import { BLANK_SWATCH, SW_CHUNK_SIZE } from 'constants/globals'
import ConfigurationContext from '../../../contexts/ConfigurationContext/ConfigurationContext'
import GenericMessage from '../../Messages/GenericMessage'
import ColorWallSwatchList from './ColorWallSwatchList'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ColorWallContext from './ColorWallContext'
import './ColorWall.scss'

type Props = {
  contain: boolean
}

const ColorWall = (props: Props) => {
  const { contain = false } = props
  const { colorWall, swatchShouldEmit } = useContext(ConfigurationContext)
  const { swatchMinSize, swatchMaxSize, swatchMinSizeZoomed, swatchMaxSizeZoomed, colorWallBgColor } = useContext(ColorWallContext)
  const { colorWallActive, items, families = [] } = useSelector(state => state.colors)
  const { brights, colorMap, colors, unorderedColors } = items
  const { messages = {} } = useIntl()
  const dispatch = useDispatch()
  const { url, params: { section, family, colorId } } = useRouteMatch()

  useEffect(() => { dispatch(filterBySection(section)) }, [section])
  useEffect(() => { dispatch(filterByFamily(family)) }, [family])
  useEffect(() => { dispatch(makeActiveColorById(colorId)) }, [colorId])

  const colorsGrid = (memoizee(() => {
    let filteredColorSets = families.filter((familyName) => family ? compareKebabs(familyName, family) : true)
    return filteredColorSets.length
      ? convertCategorizedColorsToGrid(filteredColorSets, colors, brights, colorMap, BLANK_SWATCH, SW_CHUNK_SIZE)
      : []
  }))(colors || unorderedColors)

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
            <ColorWallSwatchList
              showAll={!colorWallActive}
              immediateSelectionOnActivation={!colorWallActive}
              activeColor={colorWallActive}
              section={section}
              family={family}
              contain={contain}
              bloomRadius={colorWall.bloomRadius} // TODO: demo purposes, maybe we want to change this
              onAddColor={color => dispatch(swatchShouldEmit ? emitColor(color) : add(color))}
              colorMap={colorMap}
              swatchLinkGenerator={({ id, brandKey, colorNumber, name }) => {
                const linkUrl = generateColorWallPageUrl(section, family, id, fullColorName(brandKey, colorNumber, name))
                return linkUrl + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : '')
              }}
              minCellSize={colorWallActive ? swatchMinSizeZoomed : swatchMinSize}
              maxCellSize={colorWallActive ? swatchMaxSizeZoomed : swatchMaxSize}
              colors={colorsGrid}
              key={colorsGrid}
            />
            {colorWallActive ? (
              <div className='color-wall-wall__btns'>
                <Link
                  to={'../../../' + (url.endsWith('family/') ? '../family/' : url.endsWith('search/') ? '../search/' : '')}
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
