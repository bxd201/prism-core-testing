// @flow
import React, { useMemo } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import at from 'lodash/at'
import kebabCase from 'lodash/kebabCase'
import ColorWallContext, { colorWallContextDefault } from '../ColorWall/ColorWallContext'
import ColorWallRouter from '../ColorWall/ColorWallRouter'
import Search from '../../Search/Search'
import SearchBar from '../../Search/SearchBar'
import ColorWall from '../ColorWall/ColorWall'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'
import { ROUTE_PARAMS } from 'src/constants/globals'

import './ColorFamilyFacet.scss'
import { compareKebabs } from '../../../shared/helpers/StringUtils'
import ColorDataWrapper, { type ColorDataWrapperProps } from '../../../helpers/ColorDataWrapper/ColorDataWrapper'

type Props = FacetBinderMethods & FacetPubSubMethods & ColorDataWrapperProps & {
  colorDetailPageRoot: string,
  colorWallBgColor?: string,
  selectedColorFamily: string
}

const SearchBarNoCancel = () => {
  const { messages = {} } = useIntl()

  return (
    <div className='color-wall-wrap__chunk'>
      <SearchBar showCancelButton={false} label={at(messages, 'SEARCH.FIND_A_COLOR')[0]} showIcon={false} placeholder={at(messages, 'SEARCH.SEARCH_BY')[0]} />
    </div>
  )
}

const SearchWithinFamily = () => <Search limitSearchToFamily />

export const ColorFamilyPage = (props: Props) => {
  const { colorDetailPageRoot, colorWallBgColor, selectedColorFamily } = props
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

  return (
    <ColorWallContext.Provider value={{ ...colorWallContextDefault, colorDetailPageRoot, colorWallBgColor }}>
      <Redirect to={redirectTo} />
      <ColorWallRouter redirect={false}>
        <div className='color-wall-wrap'>
          <Switch>
            <Route path='(.*)?/search/:query' component={SearchBarNoCancel} />
            <Route path='(.*)?/search/' component={SearchBarNoCancel} />
          </Switch>
          <Switch>
            <Route path='(.*)?/section/:section/family/:family/(.*/)?search/:query' component={SearchWithinFamily} />
            <Route path='(.*)?/family/:family/(.*/)?search/:query' component={SearchWithinFamily} />
            <Route path='(.*)?/section/:section/(.*/)?search/:query' component={SearchWithinFamily} />
            <Route path='(.*)?/search/:query' component={SearchWithinFamily} />
            <Route component={ColorWall} />
          </Switch>
        </div>
      </ColorWallRouter>
    </ColorWallContext.Provider>
  )
}

ColorFamilyPage.defaultProps = {
  ...facetBinderDefaultProps,
  ...facetPubSubDefaultProps
}

export default facetBinder(ColorDataWrapper(ColorFamilyPage), 'ColorFamilyFacet')