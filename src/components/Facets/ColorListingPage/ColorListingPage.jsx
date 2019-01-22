// @flow
import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import ColorWallLocationBuffer from '../ColorWall/ColorWallLocationBuffer'
import ColorDetails from '../ColorDetails/ColorDetails'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper'
import BackToColorWall from './BackToColorWall'
import { DEFAULT_CONFIGURATIONS, ConfigurationContextProvider } from '../../../contexts/ConfigurationContext'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
const RootRedirect = () => {
  return <Redirect to={colorWallBaseUrl} />
}

// customizing the ColorWall config with ColorListingPage's specific settings
const ColorWallConfigurations = {
  ColorWall: {
    displayAddButton: false,
    displayInfoButton: false,
    displayViewDetails: true
  }
}
const Configurations = Object.assign({}, DEFAULT_CONFIGURATIONS, ColorWallConfigurations)

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
const ColorDetailsComponent = (props) => {
  return <ColorDetailsWithData {...props} />
}

// overriding the default configuration with updated CW ones to hide the info and add buttons on the swatch
// also performing manual route matching here
const ColorWallComponent = (props) => {
  const { match, ...other } = props
  const captured = match.params[0]

  // we may be manually overriding the match prop if we've matched ANYTHING after the base color wall URL, so let's clone it
  let newMatch = Object.assign({}, match)

  // if we have a match for our first param (assuming the match pattern continues to be .*)
  if (captured) {
    // ... then define section, family, and color props to populate a new params object with; the old one is useless to us
    const section = new RegExp(`/${ROUTE_PARAMS.SECTION}/([^/]*)`).exec(captured)
    const family = new RegExp(`/${ROUTE_PARAMS.FAMILY}/([^/]*)`).exec(captured)
    const color = new RegExp(`/${ROUTE_PARAMS.COLOR}/([^/]*)/([^/]*)`).exec(captured)

    Object.assign(newMatch, {
      params: {
        [ROUTE_PARAM_NAMES.SECTION]: section ? section[1] : void (0),
        [ROUTE_PARAM_NAMES.FAMILY]: family ? family[1] : void (0),
        [ROUTE_PARAM_NAMES.COLOR_ID]: color ? color[1] : void (0),
        [ROUTE_PARAM_NAMES.COLOR_SEO]: color ? color[2] : void (0)
      }
    })
  }

  return (
    <ConfigurationContextProvider value={Configurations}>
      <ColorWallLocationBuffer match={newMatch} {...other} />
    </ConfigurationContextProvider>
  )
}

const ColorListingPage = () => {
  return (
    <React.Fragment>
      <Route path='/' exact component={RootRedirect} />
      <Route path={colorWallUrlPattern} component={ColorWallComponent} />
      <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={BackToColorWall} />
      <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact render={ColorDetailsComponent} />
    </React.Fragment>
  )
}

export default ColorListingPage
