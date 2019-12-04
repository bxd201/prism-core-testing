// @flow
import React from 'react'
import { useRouteMatch, Link } from 'react-router-dom'
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
import facetBinder from 'src/facetBinder'
import ColorWallContext, { type ColorWallContextProps } from './ColorWallContext'
import './ColorWall.scss'

const ColorWall = () => {
  const config: ColorWallContextProps = React.useContext(ColorWallContext)
  const { colorWall, swatchShouldEmit } = React.useContext(ConfigurationContext)
  const { colorWallActive, items, families = [] } = useSelector(state => state.colors)
  const { brights, colorMap, colors, unorderedColors } = items
  const { messages = {} } = useIntl()
  const dispatch = useDispatch()
  const { url, params: { section, family, colorId } } = useRouteMatch()

  React.useEffect(() => { dispatch(filterBySection(section)) }, [section])
  React.useEffect(() => { dispatch(filterByFamily(family)) }, [family])
  React.useEffect(() => { dispatch(makeActiveColorById(colorId)) }, [colorId])

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
          ? <div className='color-wall-wall' style={{ backgroundColor: config.colorWallBgColor }}>
            <ColorWallSwatchList
              showAll={!colorWallActive}
              immediateSelectionOnActivation={!colorWallActive}
              activeColor={colorWallActive}
              section={section}
              family={family}
              bloomRadius={colorWall.bloomRadius} // TODO: demo purposes, maybe we want to change this
              onAddColor={color => dispatch(swatchShouldEmit ? emitColor(color) : add(color))}
              colorMap={colorMap}
              swatchLinkGenerator={({ id, brandKey, colorNumber, name }) => {
                const linkUrl = generateColorWallPageUrl(section, family, id, fullColorName(brandKey, colorNumber, name))
                return linkUrl + (url.endsWith('family/') ? 'family/' : url.endsWith('search/') ? 'search/' : '')
              }}
              minCellSize={colorWallActive ? config.swatchMinSizeZoomed : config.swatchMinSize}
              maxCellSize={colorWallActive ? config.swatchMaxSizeZoomed : config.swatchMaxSize}
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

export default facetBinder(ColorWall, 'ColorWall')
