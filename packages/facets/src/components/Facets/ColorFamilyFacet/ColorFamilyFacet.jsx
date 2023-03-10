// @flow
import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { Redirect,Route, Switch } from 'react-router-dom'
import at from 'lodash/at'
import kebabCase from 'lodash/kebabCase'
import ColorWallContext, { colorWallContextDefault } from 'src/components/Facets/ColorWall/ColorWallContext'
import HeroLoader from 'src/components/Loaders/HeroLoader/HeroLoader'
import { ROUTE_PARAMS } from 'src/constants/globals'
import facetBinder from 'src/facetSupport/facetBinder'
import { type FacetBinderMethods,facetBinderDefaultProps } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import ColorDataWrapper, { type ColorDataWrapperProps } from '../../../helpers/ColorDataWrapper/ColorDataWrapper'
import extendIfDefined from '../../../shared/helpers/extendIfDefined'
import { compareKebabs } from '../../../shared/helpers/StringUtils'
import Search from '../../Search/Search'
import SearchBar from '../../Search/SearchBar'
import ColorWall from '../ColorWall/ColorWall'
import ColorWallRouter from '../ColorWall/ColorWallRouter'
import './ColorFamilyFacet.scss'

type Props = FacetBinderMethods & FacetPubSubMethods & ColorDataWrapperProps & {
  colorDetailPageRoot: string,
  colorWallBgColor?: string,
  selectedColorFamily: string,
  loading: boolean
}

const SearchBarNoCancel = () => {
  const { messages = {} } = useIntl()

  return (
    <div className='color-wall-wrap__chunk'>
      <SearchBar label={at(messages, 'SEARCH.FIND_A_COLOR')[0]} limitSearchToFamily placeholder={messages['SEARCH.SEARCH_BY']} showCancelButton={false} showIcon={false} />
    </div>
  )
}

export const ColorFamilyPage = (props: Props) => {
  const { colorDetailPageRoot, colorWallBgColor, selectedColorFamily, loading } = props
  const { structure } = useSelector(state => at(state, 'colors')[0])
  const redirectTo = useMemo(() => {
    const selectedSectionStructure = structure.filter(v => v.families.filter(f => compareKebabs(f, selectedColorFamily)).length > 0)[0]

    // if we have a match for this family name within our family/section structure...
    if (selectedSectionStructure) {
      // extract its name to build our color wall route
      const { name } = selectedSectionStructure

      return `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}/${ROUTE_PARAMS.SECTION}/${kebabCase(name)}/${ROUTE_PARAMS.FAMILY}/${selectedColorFamily}/${ROUTE_PARAMS.SEARCH}/`
    }

    return `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}/${ROUTE_PARAMS.SEARCH}/`
  }, [structure])

  const cwContext = useMemo(() => extendIfDefined({}, colorWallContextDefault, { colorDetailPageRoot, colorWallBgColor }), [colorDetailPageRoot, colorWallBgColor])

  if (loading) {
    return <HeroLoader />
  }

  return (
    <ColorWallContext.Provider value={cwContext}>
      <Redirect to={redirectTo} />
      <ColorWallRouter redirect={false}>
        <div className='color-wall-wrap'>
          <Switch>
            <Route path='(.*)?/section/:section/family/:family/(.*/)?search/:query' component={SearchBarNoCancel} />
            <Route path='(.*)?/family/:family/(.*/)?search/:query' component={SearchBarNoCancel} />
            <Route path='(.*)?/section/:section/(.*/)?search/:query' component={SearchBarNoCancel} />
            <Route path='(.*)?/search/:query' component={SearchBarNoCancel} />
            <Route path='(.*)?/search/' component={SearchBarNoCancel} />
            <Redirect to={redirectTo} />
          </Switch>
          <Switch>
            <Route path='(.*)?/search/:query' component={Search} />
            <Route component={ColorWall} />
          </Switch>
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

ColorFamilyPage.defaultProps = { ...facetBinderDefaultProps, ...facetPubSubDefaultProps }

export default facetBinder(ColorDataWrapper(ColorFamilyPage), 'ColorFamilyFacet')
