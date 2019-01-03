import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'

import ColorWallLocationBuffer from '../ColorWall/ColorWallLocationBuffer'
import ColorDetails from '../ColorDetails/ColorDetails'

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to='/active/color-wall' />
}

class ColorListingPage extends Component {
  render () {
    return (
      <React.Fragment>
        <Route path='/' exact component={RootRedirect} />
        <Route path='/active/color-wall' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/:family' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color-wall/:family/:colorNumber' exact component={ColorWallLocationBuffer} />
        <Route path='/active/color/:colorId' exact component={ColorDetails} />
      </React.Fragment>
    )
  }
}

export default ColorListingPage
