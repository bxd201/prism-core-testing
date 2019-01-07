import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'

import { withDragDropContext } from '../../../helpers/WithDragDropContext'

import LivePalette from '../../LivePalette/LivePalette'
import ColorWallLocationBuffer from '../ColorWall/ColorWallLocationBuffer'
import SceneManager from '../../SceneManager/SceneManager'
import Search from '../../Search/Search'
import ColorsFromImage from '../../ColorsFromImage/ColorsFromImage'
import ColorDetails from '../ColorDetails/ColorDetails'
import PrismNav from './PrismNav'

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to='/active' />
}

class Prism extends Component {
  render () {
    return (
      <React.Fragment>
        <PrismNav />
        <hr />
        <Route path='/' exact component={RootRedirect} />
        <Route path='/active' exact component={SceneManager} />
        <Route path='/active/color-wall' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/:family' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/:family/:colorNumber' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/color/:colorId' exact component={ColorDetails} />
        <Route path='/active/colors-from-image' exact component={ColorsFromImage} />
        <Route path='/search' exact component={Search} />

        <LivePalette />
      </React.Fragment>
    )
  }
}

export default withDragDropContext(Prism)
