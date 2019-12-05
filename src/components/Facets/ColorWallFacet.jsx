// @flow
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import ColorWallRouter from './ColorWall/ColorWallRouter'
import Search from '../Search/Search'
import SearchBar from '../Search/SearchBar'
import ColorWall from './ColorWall/ColorWall'
import ColorWallToolbar from './ColorWall/ColorWallToolbar'
import ColorWallContext, { colorWallContextDefault } from './ColorWall/ColorWallContext'
import facetBinder from 'src/facetBinder'

export const ColorWallPage = ({ colorDetailPageRoot }: { colorDetailPageRoot: string }) => {
  return (
    <ColorWallContext.Provider value={{ ...colorWallContextDefault, colorDetailPageRoot }}>
      <ColorWallRouter>
        <div className='color-wall-wrap'>
          <Switch>
            <Route path='(.*)?/search/:query' component={SearchBar} />
            <Route path='(.*)?/search' component={SearchBar} />
            <Route path='(.*)?/section/:section/family/:family' component={ColorWallToolbar} />
            <Route path='(.*)?/section/:section/family/' component={ColorWallToolbar} />
            <Route path='(.*)?/family/:family/' component={ColorWallToolbar} />
            <Route path='(.*)?/family/' component={ColorWallToolbar} />
            <Route component={ColorWallToolbar} />
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

export default facetBinder(ColorWallPage, 'ColorWallFacet')
