/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Route, Switch } from 'react-router-dom'
import { ColorListingPage, RootRedirect, ColorDetailsComponent } from 'src/components/Facets/ColorListingPage/ColorListingPage'
import { ColorWallPage } from 'src/components/Facets/ColorWallFacet'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'

const homeRoute = '/'
const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`
const colorDetailsBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_DETAIL}`
const activeColorIdSeoUrlPattern = `${colorDetailsBaseUrl}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`
const transitionClassNames = 'cdp-slide'
const transitionClassNamesCdpSlideToWall = 'cdp-slide-to-wall cdp-slide'
const transitionClassNamesCdpSlideToDetails = 'cdp-slide-to-details cdp-slide'

const locationProp = { pathname: homeRoute }
const getColorListingPage = (props) => {
  let defaultProps = { location: locationProp }
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorListingPage {...newProps} />)
}

describe('ColorListingPage', () => {
  let colorListingPage
  beforeAll(() => {
    if (!colorListingPage) {
      colorListingPage = getColorListingPage()
    }
  })

  it('should match snapshot', () => {
    expect(colorListingPage).toMatchSnapshot()
  })

  it('should render TransitionGroup component', () => {
    expect(colorListingPage.find(TransitionGroup).exists()).toBe(true)
  })

  it('should render CSSTransition component', () => {
    expect(colorListingPage.find(CSSTransition).exists()).toBe(true)
  })

  it('should render CSSTransition with classNames defined as constant transitionClassNames', () => {
    expect(colorListingPage.find(CSSTransition).prop('classNames')).toEqual(transitionClassNames)
  })
})

describe('ColorListingPage routes', () => {
  let colorListingPage
  let pathMap = {}

  beforeAll(() => {
    if (!colorListingPage) {
      colorListingPage = getColorListingPage()
    }

    pathMap = colorListingPage.find(Route).reduce((pathMap, route) => {
      const routeProps = route.props()
      pathMap[routeProps.path] = routeProps.component
      return pathMap
    }, {})
  })

  it('should render Switch component', () => {
    expect(colorListingPage.find(Switch).exists()).toBe(true)
  })

  it('should render Switch component with location prop defined as locationProp constant', () => {
    // there are two Switches on the page, so we need to specify one of them to test against -- either is fine for this test
    expect(colorListingPage.find(Switch).get(0).props.location).toEqual(locationProp)
  })

  it('should have 3 Route components', () => {
    expect(colorListingPage.find(Route)).toHaveLength(3)
  })

  it('should show RootRedirect component for route defined as homeRoute constant', () => {
    expect(pathMap[homeRoute]).toBe(RootRedirect)
  })

  it('should show ColorWallComponent component for route defined as colorWallUrlPattern constant', () => {
    expect(pathMap[`${colorWallBaseUrl}(/.*)?`]).toBe(ColorWallPage)
  })

  it('should show ColorDetailsComponent component for route defined as activeColorIdSeoUrlPattern constant', () => {
    expect(pathMap[activeColorIdSeoUrlPattern]).toBe(ColorDetailsComponent)
  })
})

describe('ColorListingPage with state', () => {
  let colorListingPage
  let defaultStates

  beforeAll(() => {
    if (!colorListingPage) {
      colorListingPage = getColorListingPage()
    }

    defaultStates = {
      prevPathname: '/',
      toDetails: false,
      toWall: false
    }
  })

  it('should render with default state', () => {
    const colorListingPageState = colorListingPage.instance().state
    expect(colorListingPageState).toEqual(defaultStates)
  })

  it('should render CSSTransition with classNames defined as constant transitionClassNamesCdpSlideToDetails when toDetails state is true', () => {
    colorListingPage.setState({ toDetails: true })
    expect(colorListingPage.find(CSSTransition).prop('classNames')).toEqual(transitionClassNamesCdpSlideToDetails)
  })

  it('should render CSSTransition with classNames defined as constant transitionClassNamesCdpSlideToWall when toWall state is true', () => {
    colorListingPage.setState({ toWall: true })
    expect(colorListingPage.find(CSSTransition).prop('classNames')).toEqual(transitionClassNamesCdpSlideToWall)
  })
})
