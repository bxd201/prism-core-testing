import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'

import ColorWallLocationBuffer from '../ColorWall/ColorWallLocationBuffer'
import ColorDetails from '../ColorDetails/ColorDetails'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper'
import { ConfigurationContextProvider } from '../../../contexts/ConfigurationContext'

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to='/active/color-wall' />
}

// customizing the ColorWall config with ColorListingPage's specific settings
const ColorWallConfigurations = {
  ColorWall: {
    displayAddButton: false,
    displayInfoButton: false,
    displayViewDetails: true
  }
}

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
const ColorDetailsComponent = (props) => {
  return <ColorDetailsWithData />
}

// overriding the default configuration with updated CW ones to hide the info and add buttons on the swatch
const ColorWallComponent = (props) => {
  return (
    <ConfigurationContextProvider value={ColorWallConfigurations}>
      <ColorWallLocationBuffer {...props} />
    </ConfigurationContextProvider>
  )
}

class ColorListingPage extends Component {
  render () {
    return (
      <React.Fragment>
        <Route path='/' exact component={RootRedirect} />
        <Route path='/active/color-wall' exact component={ColorWallComponent} />
        <Route path='/active/color-wall/:family' exact component={ColorWallComponent} />
        <Route path='/active/color-wall/:family/:colorNumber' exact component={ColorWallComponent} />
        <Route path='/active/color/:colorId' exact render={ColorDetailsComponent} />
      </React.Fragment>
    )
  }
}

export default ColorListingPage
