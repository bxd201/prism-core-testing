// @flow
import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import LivePalette from '../../LivePalette/LivePalette'
import ColorWallRouteComponent from '../ColorWall/ColorWallRouteComponent'
import SceneManager from '../../SceneManager/SceneManager'
import ColorDetails from '../ColorDetails/ColorDetails'
import FastMask from '../../FastMask/FastMask'
import PrismNav from './PrismNav'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
export const RootRedirect = () => {
  return <Redirect to='/active' />
}

type Props = {}

export class Prism extends Component<Props> {
  render () {
    return (
      <React.Fragment>
        <PrismNav />
        <hr />
        <Route path='/' exact component={RootRedirect} />
        <Route path='/active' exact component={SceneManager} />
        <Route path={colorWallUrlPattern} component={ColorWallRouteComponent} />
        <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetails} />
        <Route path='/fast-mask' exact component={FastMask} />
        <LivePalette />
      </React.Fragment>
    )
  }
}

export default Prism
