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
import type { Color } from 'src/shared/types/Colors.js.flow'

export type CrossSearch = {
  brand: { id: string, name: string },
  onClickFindChip: (Color) => string,
  onClickViewColor: (Color) => string,
  text: string
}
type Props = FacetBinderMethods & FacetPubSubMethods & ColorDataWrapperProps & {
  colorDetailPageRoot?: (Color) => string,
  colorWallBgColor?: string,
  colorWallPageRoot?: (Color) => string,
  crossSearchChipLocator?: CrossSearch,
  loading: boolean,
  routeType: string
}

const SearchBarLight = ({ hideSearchResult, onSearchQuery }: { hideSearchResult: () => void, onSearchQuery: (string) => void }) => (
  <div className='color-wall-wrap__chunk'>
    <SearchBar
      className='SearchBarLight'
      onClickBackButton={hideSearchResult}
      onSearchQuery={onSearchQuery}
      placeholder='What color are you looking for?'
      showBackButton
      showCancelButton={false}
      showLabel={false}
    />
  </div>
)

export const ColorSearch = (props: Props) => {
  const { colorDetailPageRoot, colorWallBgColor, colorWallPageRoot, crossSearchChipLocator, loading, routeType } = props
  const { primeColorWall } = useSelector(state => at(state, 'colors')[0])
  const redirectTo = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}/${ROUTE_PARAMS.SECTION}/${kebabCase(primeColorWall)}/${ROUTE_PARAMS.SEARCH}/`
  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, {
    colorDetailPageRoot,
    colorWallBgColor,
    colorWallPageRoot,
    routeType
  }), [colorDetailPageRoot, colorWallBgColor, colorWallPageRoot, routeType])
  const [mounted, setMounted] = useState(true)
  const [crossSearch, setCrossSearch] = useState({ query: undefined, searching: false })
  const { publish } = useContext(PubSubCtx)

  useEffect(() => {
    return () => {
      setMounted(true)
    }
  }, [mounted])

  if (loading) {
    return <HeroLoader />
  }

  return (
    <>
      {mounted && <div id='prism-color-search-container' className='color-search'>
        <ColorWallContext.Provider value={cwContext}>
          <Redirect to={redirectTo} />
          <ColorWallRouter redirect={false}>
            <div className='color-wall-wrap'>
              <div className='color-wall-wrap__search-bar'>
                <SearchBarLight
                  hideSearchResult={() => {
                    publish('prism-close-color-search')
                    setMounted(false)
                  }}
                  onSearchQuery={(value) => { setCrossSearch({ query: value, searching: false }) }}
                />
              </div>
              <Route path='(.*)?/search/:query' render={() =>
                <>
                  <h6 className='color-search__title'>{crossSearch.searching ? crossSearchChipLocator?.brand.name : primeColorWall} Colors</h6>
                  <div className='color-search__container'>
                    <Search
                      isChipLocator
                      closeSearch={() => {
                        publish('prism-close-color-search')
                        setMounted(false)
                      }}
                      crossSearch={{ onSearch: () => setCrossSearch(prev => ({ query: prev.query, searching: true })), ...crossSearch, ...crossSearchChipLocator }}
                    />
                  </div>
                  <div className='color-search__margin-bottom' />
                </>}
              />
            </div>
          </ColorWallRouter>
        </ColorWallContext.Provider>
      </div>}
    </>
  )
}

ColorSearch.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDataWrapper(ColorSearch), 'ColorSearchFacet')
