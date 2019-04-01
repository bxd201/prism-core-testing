/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Route } from 'react-router'
import { Prism, RootRedirect } from 'src/components/Facets/Prism/Prism'
import { SceneManager } from 'src/components/SceneManager/SceneManager'
import ColorWallRouteComponent from 'src/components/Facets/ColorWall/ColorWallRouteComponent'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import { ColorDetails } from 'src/components/Facets/ColorDetails/ColorDetails'
import ColorsFromImage from 'src/components/ColorsFromImage/ColorsFromImage'
import { Search } from 'src/components/Search/Search'

const homeRoute = '/'
const activeRoute = '/active'
const activeColorsFromImageRoute = '/active/colors-from-image'
const searchRoute = '/search'
const prismNavWithRouterSelect = 'withRouter(PrismNav)'
const livePaletteConnectSelect = 'Connect(LivePalette)'

const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`
const activeColorIdSeoUrlPattern = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR}/:${ROUTE_PARAM_NAMES.COLOR_ID}/:${ROUTE_PARAM_NAMES.COLOR_SEO}`

const getPrism = (props) => {
  let defaultProps = {
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<Prism {...newProps} />)
}

describe('Prism routes', () => {
  let prism
  let pathMap = {}

  beforeAll(() => {
    if (!prism) {
      prism = getPrism()
    }

    pathMap = prism.find(Route).reduce((pathMap, route) => {
      const routeProps = route.props()
      pathMap[routeProps.path] = routeProps.component
      return pathMap
    }, {})
  })

  it('should match snapshot', () => {
    expect(prism).toMatchSnapshot()
  })

  it('should have 6 Route components', () => {
    expect(prism.find(Route)).toHaveLength(6)
  })

  it('should show RootRedirect component for route defined as homeRoute constant', () => {
    expect(pathMap[homeRoute]).toBe(RootRedirect)
  })

  it('should show SceneManager component for route defined as activeRoute constant', () => {
    expect(pathMap[activeRoute].WrappedComponent).toBe(SceneManager)
  })

  it('should show ColorWallRouteComponent for route defined as colorWallUrlPattern constant', () => {
    expect(pathMap[colorWallUrlPattern]).toBe(ColorWallRouteComponent)
  })

  it('should show ColorDetails component for route defined as activeColorIdSeoUrlPattern constant', () => {
    expect(pathMap[activeColorIdSeoUrlPattern].WrappedComponent).toBe(ColorDetails)
  })

  it('should show ColorsFromImage component for route defined as activeColorsFromImageRoute constant', () => {
    expect(pathMap[activeColorsFromImageRoute]).toBe(ColorsFromImage)
  })

  it('should show Search component for route defined as searchRoute constant', () => {
    expect(pathMap[searchRoute].WrappedComponent).toBe(Search)
  })

  it('should show component defined as prismNavWithRouterSelect constant', () => {
    expect(prism.find(prismNavWithRouterSelect).exists()).toBe(true)
  })

  it('should show component defined as livePaletteConnectSelect constant', () => {
    expect(prism.find(livePaletteConnectSelect).exists()).toBe(true)
  })
})
