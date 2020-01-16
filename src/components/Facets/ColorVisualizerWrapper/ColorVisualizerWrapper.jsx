// @flow
import ColorCollection from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper/ColorDataWrapper'
import ColorVisualizerNav, { isMyIdeas, isScene, isColors, isInspiration, isHelp } from './ColorVisualizerNav'
import React, { Component } from 'react'
import SceneManager from '../../SceneManager/SceneManager'
import ColorWallContext, { colorWallContextDefault } from '../ColorWall/ColorWallContext'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'

import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import MatchPhoto from '../../MatchPhoto/MatchPhoto'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import Help from '../../Help/Help'
import { withRouter } from 'react-router'
import DropDownMenu from './RouteComponents'
import { RouteContext } from '../../../contexts/RouteContext/RouteContext'
const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`

// this is very vague because react-router doesn't have the ability to match /section/x/family/y/color/z and /section/x/color/z with the same route
// we're handling the URL-parsing logic manually in ColorWallComponent below
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`

// since the CDP component won't have any color information if we go to it directly, we need to wrap it
// in the ColorDataWrapper HOC to ensure it has color data prior to rendering it.
const ColorDetailsWithData = ColorDataWrapper(ColorDetails)
const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`

// barebones component to always take the user to active if they try to access root.
// not sure if we need this but if we end up using this for TAG & want to retain bookmarks..

// Route constants
export const MY_IDEAS_PREVIEW = '/my-ideas-preview'
export const MATCH_PHOTO = '/match-photo'
export const MY_IDEAS = '/my-ideas'

export const RootRedirect = () => {
  return <Redirect to='/active' />
}

type Props = FacetPubSubMethods & FacetBinderMethods & {
  toggleCompareColor: boolean
}

export class ColorVisualizerWrapper extends Component<Props> {
  static defaultProps = {
    ...facetPubSubDefaultProps,
    ...facetBinderDefaultProps
  }
  constructor (props) {
    super(props)
    const { pathname } = this.props.location
    const isShow = isMyIdeas(pathname) || isScene(pathname) || isColors(pathname) || isInspiration(pathname) || isHelp(pathname) || '/active'
    this.state = {
      close: pathname !== '/active/colors' || pathname !== '/active/inspiration' || pathname !== '/active/scenes',
      showDefaultPage: isShow
    }
  }

  onRouteChanged = () => {
    const { showDefaultPage } = this.state
    if (showDefaultPage) {
      this.setState({ close: false })
    }
  }

  close = (e) => {
    if (e.target.matches('div.nav__dropdown-overlay') || e.target.matches('a')) {
      this.props.history.push('/active')
      this.setState({ close: true })
    }
  }
  redirectTo=() => {
    this.setState({ close: true, showDefaultPage: false })
  }

  open = (isShowDropDown, close) => {
    this.setState({ close: close, showDefaultPage: isShowDropDown })
  }

  renderComponent = (url, type) => {
    if (type !== '') {
      if (type === 'MATCH A PHOTO') {
        this.props.history.push('/match-photo')
      }
      if (type === 'UPLOAD YOUR PHOTO') {
        this.props.history.push('/paint-scene')
      }
      this.setState({ imgUrl: url, close: true, showDefaultPage: false })
    }
  }

  render () {
    const { toggleCompareColor } = this.props
    const { close, showDefaultPage, imgUrl } = this.state
    return (
      <React.Fragment>
        <div className='cvw__root-container'>
          <RouteContext.Provider value={{
            navigate: (isShowDropDown, close) => this.open(isShowDropDown, close)
          }}>
            <ColorVisualizerNav />
            {/* will be navigation bar here */}
            {!toggleCompareColor &&
            <div className='cvw__root-wrapper'>

              <Route path='/' exact component={RootRedirect} />
              {/* <Route path='/active' exact component={() => <SceneManager expertColorPicks />} /> */}
              <Route path={colorWallUrlPattern}>
                <ColorWallContext.Provider value={{ ...colorWallContextDefault }}>
                  <ColorWallPage />
                </ColorWallContext.Provider>
              </Route>
              <Route path={`${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetailsWithData} />
              <Route path='/color-from-image' component={InspiredScene} />
              <Route path='/color-collections' component={(props) => (<ColorCollection isExpertColor={false} {...props.location.state} />)} />
              <Route path='/expert-colors' component={() => <ExpertColorPicks isExpertColor />} />
              {/* @todo - implement MyIdeas -RS */}
              <Route path={MY_IDEAS} render={() => <MyIdeasContainer />} />
              <Route path={MY_IDEAS_PREVIEW} component={MyIdeaPreview} />
              <Route path='/match-photo' render={() => <MatchPhoto imgUrl={imgUrl} />} />
              <Route path='/paint-scene' render={() => <MatchPhoto isPaintScene imgUrl={imgUrl} />} />
              <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetails} />
              <Route path='/help' component={Help} />
              {showDefaultPage && <SceneManager expertColorPicks />}
              {/* <MatchPhoto isPaintScene /> */}
              {!close && <div role='presentation' className='nav__dropdown-overlay' onClick={this.close}>
                <Route path='/active/colors' component={(props) => <DropDownMenu dataKey='color' close={this.close} redirectTo={this.redirectTo} getImageUrl={(url, type) => this.renderComponent(url, type)} />} />
                <Route path='/active/inspiration' component={() => <DropDownMenu dataKey='inspiration' close={this.close} redirectTo={this.redirectTo} getImageUrl={(url, type) => this.renderComponent(url, type)} />} />
                <Route path='/active/scenes' component={() => <DropDownMenu dataKey='scenes' close={this.close} redirectTo={this.redirectTo} getImageUrl={(url, type) => this.renderComponent(url, type)} />} />
              </div>}
              <LivePalette />
            </div>
            }
            {toggleCompareColor && <CompareColor />}
          </RouteContext.Provider>
        </div>
      </React.Fragment>
    )
  }

  componentDidUpdate (prevProps) {
    if (this.props.location !== prevProps.location && this.props.location.pathname !== '/active') {
      this.onRouteChanged()
    }
  }

  componentWillUnmount () {
    if (typeof this.props.unsubscribeAll === 'function') {
      this.props.unsubscribeAll()
    }
  }
}

const mapStateToProps = (state, props) => {
  return {
    toggleCompareColor: state.lp.toggleCompareColor
  }
}
export default facetBinder(connect(mapStateToProps, null)(withRouter(ColorVisualizerWrapper)), 'ColorVisualizerWrapper')
