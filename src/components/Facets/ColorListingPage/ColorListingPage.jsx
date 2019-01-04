import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'

import ColorWallLocationBuffer from '../ColorWall/ColorWallLocationBuffer'
import ColorDetails from '../ColorDetails/ColorDetails'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to='/active/color-wall' />
}

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
const ColorDetailsComponent = (props) => {
  return <ColorDetailsWithData />
}

class ColorListingPage extends Component {
  render () {
    return (
      <React.Fragment>
        <Route path='/' exact component={RootRedirect} />
        <Route path='/active/color-wall' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/:family' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/:family/:colorNumber' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color/:colorId' exact render={ColorDetailsComponent} />
      </React.Fragment>
    )
  }
}

export default ColorListingPage
