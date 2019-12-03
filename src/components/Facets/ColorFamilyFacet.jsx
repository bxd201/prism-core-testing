// @flow
import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import facetBinder from 'src/facetBinder'

export const ColorFamilyPage = ({ selectedColorFamily }: Object) => (
  <ColorWallRouter>
    <div className='color-wall-wrap'>
      <Switch>
        <Redirect to={`/active/color-wall/section/sherwin-williams-colours/family/${selectedColorFamily}/search`} />
      </Switch>
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
)

export default facetBinder(ColorFamilyPage, 'ColorFamilyFacet')
