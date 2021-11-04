// @flow
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import at from 'lodash/at'
import kebabCase from 'lodash/kebabCase'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import ColorWallRouter from '../ColorWall/ColorWallRouter'
import Search from '../../Search/Search'
import SearchBar from '../../Search/SearchBar'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps, PubSubCtx } from 'src/facetSupport/facetPubSub'
import { ROUTE_PARAMS } from 'src/constants/globals'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import './ColorSearchFacet.scss'
import ColorDataWrapper, { type ColorDataWrapperProps } from '../../../helpers/ColorDataWrapper/ColorDataWrapper'
import extendIfDefined from '../../../shared/helpers/extendIfDefined'

type Props = FacetBinderMethods & FacetPubSubMethods & ColorDataWrapperProps & {
  colorDetailPageRoot?: string,
  colorNumOnBottom?: boolean,
  colorWallBgColor?: string,
  colorWallChunkPageRoot?: string,
  loading: boolean
}

const SearchBarLight = ({ hideContainer }: { hideContainer: () => void }) => {
  const { publish } = useContext(PubSubCtx)

  return (
    <div className='color-wall-wrap__chunk'>
      <SearchBar
        className='SearchBarLight'
        onClickBackButton={() => {
          hideContainer()
          publish('prism-close-color-search')
        }}
        placeholder='What color are you looking for?'
        showBackButton
        showCancelButton={false}
        showLabel={false}
      />
    </div>
  )
}

export const ColorSearch = (props: Props) => {
  const baseHostUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
  const { colorDetailPageRoot = baseHostUrl, colorNumOnBottom = true, colorWallBgColor, colorWallChunkPageRoot = baseHostUrl, loading } = props
  const { primeColorWall } = useSelector(state => at(state, 'colors')[0])
  const [containerHeight, setContainerHeight] = useState(0)
  const redirectTo = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}/${ROUTE_PARAMS.SECTION}/${kebabCase(primeColorWall)}/${ROUTE_PARAMS.SEARCH}/`
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    colorDetailPageRoot,
    colorNumOnBottom,
    colorWallBgColor,
    colorWallChunkPageRoot
  }), [colorDetailPageRoot, colorNumOnBottom, colorWallBgColor, colorWallChunkPageRoot])

  useEffect(() => {
    setTimeout(() => {
      setContainerHeight(100)
    }, 1000)
  }, [])

  if (loading) {
    return <HeroLoader />
  }

  return (
    <div id='prism-color-search-container' className='ColorSearch' style={{ height: `${containerHeight}vh` }}>
      <ColorWallContext.Provider value={cwContext}>
        <Redirect to={redirectTo} />
        <ColorWallRouter redirect={false}>
          <div className='color-wall-wrap'>
            <div className='color-wall-wrap__search-bar'>
              <SearchBarLight hideContainer={() => { setContainerHeight(0) }} />
            </div>
            <Route path='(.*)?/search/:query' render={() => <><h6 className='ColorSearch__title'>{primeColorWall} Colors</h6><Search isChipLocator /></>} />
          </div>
        </ColorWallRouter>
      </ColorWallContext.Provider>
    </div>
  )
}

ColorSearch.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDataWrapper(ColorSearch), 'ColorSearchFacet')
