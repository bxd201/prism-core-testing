// @flow
import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { withDragDropContext } from '../../../helpers/WithDragDropContext'

import LivePalette from '../../LivePalette/LivePalette'
import ColorWallRouteComponent from '../ColorWall/ColorWallRouteComponent'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import SceneManager from '../../SceneManager/SceneManager'
import ColorDetails from '../ColorDetails/ColorDetails'
import FastMask from '../../FastMask/FastMask'
import PrismNav from './PrismNav'
import ColorCollection from '../../ColorCollections/ColorCollections'
import CompareColor from '../../CompareColor/CompareColor'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import MatchPhoto from '../../MatchPhoto/MatchPhoto'
const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..
export const RootRedirect = () => {
  return <Redirect to='/active' />
}

type Props = {toggleCompareColor: boolean}

export class Prism extends Component<Props> {
  render () {
    const { toggleCompareColor } = this.props
    return (
      <React.Fragment>
        <div className='prism__root-container'>
          <PrismNav />
          <hr />
          {!toggleCompareColor &&
            <div className='prism__root-wrapper'>
              <Route path='/' exact component={RootRedirect} />
              <Route path='/active' exact component={SceneManager} />
              <Route path={colorWallUrlPattern} component={ColorWallRouteComponent} />
              <Route path='/color-from-image' component={InspiredScene} />
              <Route path='/color-collections' component={ColorCollection} />
              <Route path='/expert-colors' component={() => <ColorCollection isExpertColor />} />
              <Route path='/match-photo' component={MatchPhoto} />
              <Route path='/paint-scene' render={() => <MatchPhoto isPaintScene />} />
              <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetails} />
              <Route path='/fast-mask' exact component={FastMask} />
            </div>
          }
          {toggleCompareColor && <CompareColor />}
          <LivePalette />
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    toggleCompareColor: state.lp.toggleCompareColor
  }
}

export default connect(mapStateToProps, null)(withDragDropContext(Prism))
