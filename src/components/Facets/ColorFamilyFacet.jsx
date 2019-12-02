// @flow
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import facetBinder from 'src/facetBinder'

export const ColorFamilyPage = () => (
  <ColorWallRouter>
    <div className='color-wall-wrap'>
      <Switch>
        <Route path='(.*)?/search/:query' component={() => <SearchBar showCancelButton={false} />} />
        <Route path='(.*)?/search/' component={() => <SearchBar showCancelButton={false} />} />
      </Switch>
      <Switch>
        <Route path='(.*)?/search/:query' component={Search} />
        <Route component={ColorWall} />
      </Switch>
    </div>
  </ColorWallRouter>
)

export default facetBinder(ColorFamilyPage, 'ColorFamilyFacet')
