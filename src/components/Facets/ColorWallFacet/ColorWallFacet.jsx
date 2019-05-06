// @flow
import React from 'react'
import { Route, Redirect, withRouter, Switch } from 'react-router-dom'

import { ROUTE_PARAMS } from 'constants/globals'

import ColorWallRouteComponent from '../ColorWall/ColorWallRouteComponent'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

export const RootRedirectColorWall = () => {
  return <Redirect to={colorWallBaseUrl} />
}

type ColorWallFacetProps = {
  location: Location
}

export function ColorWallFacet ({ location }: ColorWallFacetProps) {
  return (
    <Switch location={location}>
      <Route path='/' exact component={RootRedirectColorWall} />
      <Route path={colorWallUrlPattern} component={ColorWallRouteComponent} />
    </Switch>
  )
}
export default withRouter(ColorWallFacet)
