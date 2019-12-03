// @flow
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import ColorWallToolbar from './ColorWall/ColorWallToolbar'
import facetBinder from 'src/facetBinder'

export const ColorWallPage = () => (
  <ColorWallRouter>
    <div className='color-wall-wrap'>
      <Switch>
        <Route path='(.*)?/search/:query' component={SearchBar} />
        <Route path='(.*)?/search' component={SearchBar} />
        <Route component={ColorWallToolbar} />
      </Switch>
      <Switch>
        <Route path='(.*)?/search/:query' component={Search} />
        <Route component={ColorWall} />
      </Switch>
    </div>
  </ColorWallRouter>
)

export default facetBinder(ColorWallPage, 'ColorWallFacet')