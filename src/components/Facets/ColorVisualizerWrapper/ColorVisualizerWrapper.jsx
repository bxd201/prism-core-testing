// @flow
import ColorCollection from '../../ColorCollections/ColorCollections'
import ExpertColorPicks from '../../ExpertColorPicks/ExpertColorPicks'
import { ColorWallPage } from '../ColorWallFacet'
import ColorDetails from '../ColorDetails/ColorDetails'
import CompareColor from '../../CompareColor/CompareColor'
import InspiredScene from '../../InspirationPhotos/InspiredSceneNavigator'
import LivePalette from '../../LivePalette/LivePalette'
import ColorDataWrapper from '../../../helpers/ColorDataWrapper/ColorDataWrapper'
import ColorVisualizerNav, { isColors, isInspiration } from './ColorVisualizerNav'
import React, { Component } from 'react'
import SceneManager from '../../SceneManager/SceneManager'
import ColorWallContext, { colorWallContextDefault } from '../ColorWall/ColorWallContext'
import facetBinder from 'src/facetSupport/facetBinder'
import { facetBinderDefaultProps, type FacetBinderMethods } from 'src/facetSupport/facetInstance'
import { type FacetPubSubMethods, facetPubSubDefaultProps } from 'src/facetSupport/facetPubSub'

import { connect } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'

import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import ImageRotateContainer from '../../MatchPhoto/ImageRotateContainer'
import MyIdeasContainer from '../../MyIdeasContainer/MyIdeasContainer'
import MyIdeaPreview from '../../MyIdeaPreview/MyIdeaPreview'
import Help from '../../Help/Help'
import { withRouter } from 'react-router'
import DropDownMenu from './RouteComponents'
import { RouteContext } from '../../../contexts/RouteContext/RouteContext'
import { CVWWarningModal } from './WarningModal'
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
const PAINT_SCENE_COMPONENT = 'PaintScene'
const SCENE_MANAGER_COMPONENT = 'SceneManager'
const PAINT_SCENE_ROUTE = '/paint-scene'
const ACTIVE_ROUTE = '/active'
const HELP_ROUTE = '/help'

export const MY_IDEAS_PREVIEW = '/my-ideas-preview'
export const MATCH_PHOTO = '/match-photo'
export const MY_IDEAS = '/my-ideas'
const TYPE_MATCH_PHOTO = 'MATCH_A_PHOTO'
const TYPE_UPLOAD_YOUR_PHOTO = 'UPLOAD_YOUR_PHOTO'
const USE_OUR_PHOTOS = 'USE_OUR_PHOTOS'
export const HELP_PATH = '/help'

export const RootRedirect = () => {
  return <Redirect to='/active' />
}

type Props = FacetPubSubMethods & FacetBinderMethods & {
  toggleCompareColor: boolean
}

const pathNameSet = new Set([`${ACTIVE_ROUTE}/colors`, `${ACTIVE_ROUTE}/inspiration`, `${ACTIVE_ROUTE}/scenes`, ACTIVE_ROUTE, '/'])
const nonOverlayRouteSet = new Set([ACTIVE_ROUTE, HELP_ROUTE, MY_IDEAS])

export class ColorVisualizerWrapper extends Component<Props> {
  static defaultProps = {
    ...facetPubSubDefaultProps,
    ...facetBinderDefaultProps
  }

  constructor (props) {
    super(props)
    const { pathname } = this.props.location
    const isShow = pathNameSet.has(pathname)
    this.state = {
      close: !isShow,
      showDefaultPage: isShow,
      showPaintScene: false,
      remountKey: (new Date()).getTime(),
      lastActiveComponent: SCENE_MANAGER_COMPONENT,
      helpLinkRef: null,
      isTabbedOutFromHelp: false,
      isShowWarningModal: false,
      checkIsPaintSceneUpdate: false,
      isUseOurPhoto: false,
      showMatchPhoto: false,
      isFromMyIdeas: false
    }
  }

  onRouteChanged = () => {
    const currLocation = this.props.location.pathname
    const isSubRoute = isColors(currLocation) || isInspiration(currLocation)
    const { showDefaultPage, showPaintScene, lastActiveComponent } = this.state
    let isShowPaintScene = true
    let isShowDefaultPage = true
    if (showPaintScene) {
      isShowDefaultPage = false
    }
    if (showDefaultPage) {
      isShowPaintScene = false
    }
    if (showPaintScene || showDefaultPage) {
      if (pathNameSet.has(currLocation)) {
        this.setState({ close: false, showPaintScene: isShowPaintScene, showDefaultPage: isShowDefaultPage })
      } else if (isSubRoute) {
        this.setState({ showPaintScene: false, showDefaultPage: false, close: true })
      } else {
        this.setState({ showPaintScene: isShowPaintScene, showDefaultPage: isShowDefaultPage })
      }
    } else {
      if (pathNameSet.has(currLocation)) {
        if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
          this.setState({ showDefaultPage: true, showPaintScene: false, close: false })
        }
        if (lastActiveComponent === PAINT_SCENE_COMPONENT) {
          this.setState({ showDefaultPage: false, showPaintScene: true, close: false })
        }
      }
    }
  }

  close = (e) => {
    if (e.target.matches('div.nav__dropdown-overlay') || e.target.matches('a') || e.target.matches('span') || e.target.matches('button') || e.target.matches('svg') || e.target.matches('path')) {
      this.props.history.push(ACTIVE_ROUTE)
      this.setState({ close: true })
    }
  }

  redirectTo=() => {
    this.setState({ close: true })
  }

  open = (isShowDropDown, close) => {
    const { lastActiveComponent } = this.state
    if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
      this.setState({ showDefaultPage: isShowDropDown, showPaintScene: false })
    }
    if (lastActiveComponent === PAINT_SCENE_COMPONENT) {
      this.setState({ showDefaultPage: false, showPaintScene: isShowDropDown })
    }
    this.setState({ close: close })
  }

  setActiveComponent =() => {
    const { lastActiveComponent } = this.state
    if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
      this.setState({ showDefaultPage: true, showPaintScene: false })
    }
    if (lastActiveComponent === PAINT_SCENE_COMPONENT) {
      this.setState({ showDefaultPage: false, showPaintScene: true })
    }
  }

  redirectMyIdeas = () => {
    this.props.history.push(ACTIVE_ROUTE)
    this.setState({
      imgUrl: '',
      showDefaultPage: false,
      close: true,
      showPaintScene: true,
      showMatchPhoto: false,
      remountKey: (new Date()).getTime(),
      lastActiveComponent: PAINT_SCENE_COMPONENT,
      isFromMyIdeas: true
    })
  }

  renderComponent = (url, type) => {
    const { checkIsPaintSceneUpdate, lastActiveComponent } = this.state
    if (type === USE_OUR_PHOTOS) {
      this.setState({
        checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate,
        isUseOurPhoto: true
      })
    } else if (type === TYPE_MATCH_PHOTO || type === TYPE_UPLOAD_YOUR_PHOTO) {
      if (type === TYPE_MATCH_PHOTO) {
        this.props.history.push(MATCH_PHOTO)
        this.setState({
          imgUrl: url,
          showDefaultPage: false,
          showPaintScene: false,
          close: true,
          showMatchPhoto: true,
          remountKey: this.state.remountKey,
          lastActiveComponent: lastActiveComponent,
          isFromMyIdeas: false
        })
      }
      if (type === TYPE_UPLOAD_YOUR_PHOTO) {
        if (lastActiveComponent === SCENE_MANAGER_COMPONENT) {
          // check scene manager whether update here
          this.props.history.push(PAINT_SCENE_ROUTE)
          this.setState({
            imgUrl: url,
            showDefaultPage: false,
            close: true,
            showPaintScene: true,
            showMatchPhoto: false,
            remountKey: (new Date()).getTime(),
            lastActiveComponent: PAINT_SCENE_COMPONENT,
            isFromMyIdeas: false
          })
        } else {
          this.setState({ checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate, tmpUrl: url, isFromMyIdeas: false })
        }
      }
    } else {
      this.setState({
        showDefaultPage: false,
        showPaintScene: false,
        lastActiveComponent: lastActiveComponent,
        isFromMyIdeas: false
      })
    }
  }

  setHelpLinkRef = (helpLinkRef) => {
    if (this.state.helpLinkRef === null) {
      this.setState({
        helpLinkRef: helpLinkRef
      })
    }
  }

  setIsTabbedOutFromHelp = () => {
    this.setState({
      isTabbedOutFromHelp: true
    })
  }

  showWarningModal = (base64) => {
    this.setState({ isShowWarningModal: true, tmpPaintSceneImage: base64 })
  }

  loadNewCanvas=() => {
    const { tmpUrl, checkIsPaintSceneUpdate, isUseOurPhoto } = this.state
    if (isUseOurPhoto) {
      this.setState({
        showDefaultPage: true,
        showPaintScene: false,
        lastActiveComponent: SCENE_MANAGER_COMPONENT,
        remountKey: (new Date()).getTime(),
        isShowWarningModal: false,
        isUseOurPhoto: false,
        checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate
      })
    }
    if (!isUseOurPhoto) {
      this.setState({
        imgUrl: tmpUrl,
        showDefaultPage: false,
        close: true,
        showPaintScene: true,
        remountKey: (new Date()).getTime(),
        lastActiveComponent: PAINT_SCENE_COMPONENT,
        isShowWarningModal: false,
        checkIsPaintSceneUpdate: !checkIsPaintSceneUpdate
      })
    }
  }

  cancle = () => {
    this.setState({ isShowWarningModal: false })
  }

  render () {
    const { close, showDefaultPage, imgUrl, showPaintScene, remountKey, isShowWarningModal, tmpPaintSceneImage, checkIsPaintSceneUpdate, helpLinkRef, isTabbedOutFromHelp, isFromMyIdeas } = this.state
    const { toggleCompareColor, location } = this.props
    const dropMenuProps = {
      close: this.close,
      redirectTo: this.redirectTo,
      getImageUrl: (url, type) => this.renderComponent(url, type)
    }
    return (
      <React.Fragment>
        <div className='cvw__root-container'>
          <RouteContext.Provider value={{
            navigate: (isShowDropDown, close) => this.open(isShowDropDown, close),
            setActiveComponent: () => this.setActiveComponent(),
            getHelpLinkRef: (helpRef) => this.setHelpLinkRef(helpRef),
            setIsTabbedOutFromHelp: () => this.setIsTabbedOutFromHelp(),
            showWarningModal: (base64) => this.showWarningModal(base64),
            loadNewCanvas: () => this.loadNewCanvas(),
            redirectMyIdeas: () => this.redirectMyIdeas()
          }}>
            {isShowWarningModal && <CVWWarningModal miniImage={tmpPaintSceneImage} cancle={this.cancle} confirm={this.loadNewCanvas} />}
            <div className={`cvw__root-container__nav-wrapper ${(location.pathname === HELP_PATH) ? `cvw__root-container__nav-wrapper--hide` : (location.pathname === MY_IDEAS) ? `cvw__root-container__nav-wrapper--hide-my-ideas` : ``}`}>
              <ColorVisualizerNav />
            </div>
            {!toggleCompareColor &&
            <div className='cvw__root-wrapper'>
              <Route path='/' exact component={RootRedirect} />
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
              <Route path={`/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`} exact component={ColorDetails} />
              <Route path='/help' component={Help} />
              <Route path='/match-photo' render={() => <ImageRotateContainer showPaintScene imgUrl={imgUrl} />} />
              {showDefaultPage && <SceneManager expertColorPicks />}
              <ImageRotateContainer isFromMyIdeas={isFromMyIdeas} isPaintScene checkIsPaintSceneUpdate={checkIsPaintSceneUpdate} showPaintScene={showPaintScene} imgUrl={imgUrl} key={remountKey} />
              <div className={`${isShowWarningModal ? 'cvw__modal__overlay' : 'cvw__route-wrapper'}`} />
              {!close && <div role='presentation' className={`${(!close && !nonOverlayRouteSet.has(location.pathname)) ? 'nav__dropdown-overlay' : ''}`} onClick={this.close}>
                <Route path='/active/colors' component={(props) => <DropDownMenu isTabbedOutFromHelp={isTabbedOutFromHelp} helpLinkRef={helpLinkRef} dataKey='color' {...dropMenuProps} />} />
                <Route path='/active/inspiration' component={() => <DropDownMenu isTabbedOutFromHelp={isTabbedOutFromHelp} helpLinkRef={helpLinkRef} dataKey='inspiration' {...dropMenuProps} />} />
                <Route path='/active/scenes' component={() => <DropDownMenu isTabbedOutFromHelp={isTabbedOutFromHelp} helpLinkRef={helpLinkRef} dataKey='scenes' {...dropMenuProps} />} />
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
    if (this.props.location !== prevProps.location && this.props.location.pathname !== ACTIVE_ROUTE) {
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
