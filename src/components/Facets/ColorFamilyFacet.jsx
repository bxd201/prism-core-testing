// @flow
import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import facetBinder from 'src/facetBinder'

import { ROUTE_PARAMS } from '../../constants/globals'

export const ColorFamilyPage = ({ selectedColorFamily }: Object) => {
  let colorFamilyUrl = 'sherwin-williams-colors/family/red'
  switch (selectedColorFamily) {
    case 'timeless-color':
      colorFamilyUrl = `timeless-colors`
      break

    case 'historic-color':
      colorFamilyUrl = `historic-colors`
      break

    default:
      colorFamilyUrl = `sherwin-williams-colors/${ROUTE_PARAMS.FAMILY}/${selectedColorFamily}`
  }

  return (
    <>
      <Redirect to={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}/${ROUTE_PARAMS.SECTION}/${colorFamilyUrl}/${ROUTE_PARAMS.SEARCH}/`} />
      <ColorWallRouter>
        <div className='color-wall-wrap'>
          <Switch>
            <Route path='(.*)?/search/:query' component={() => <SearchBar showCancelButton={false} />} />
            <Route path='(.*)?/search/' component={() => <SearchBar showCancelButton={false} />} />
          </Switch>
          <Switch>
            <Route path='(.*)?/family/:family/search/:query' component={Search} />
            <Route path='(.*)?/search/:query' component={Search} />
            <Route component={ColorWall} />
          </Switch>
        </div>
      </ColorWallRouter>
    </>
  )
}

export default facetBinder(ColorFamilyPage, 'ColorFamilyFacet')
