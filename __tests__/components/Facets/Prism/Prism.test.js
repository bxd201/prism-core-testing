/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Route } from 'react-router'
import { Prism, RootRedirect } from 'src/components/Facets/Prism/Prism'
import { SceneManager } from 'src/components/SceneManager/SceneManager'
import ColorWallRouteComponent from 'src/components/Facets/ColorWall/ColorWallRouteComponent'
import { ROUTE_PARAMS, ROUTE_PARAM_NAMES } from 'constants/globals'
import ColorDetails from 'src/components/Facets/ColorDetails/ColorDetails'

const homeRoute = '/'
const activeRoute = '/active'
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

  it('should have 9 Route components', () => {
    expect(prism.find(Route)).toHaveLength(9)
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
    expect(pathMap[activeColorIdSeoUrlPattern]).toBe(ColorDetails)
  })

  it('should show component defined as livePaletteConnectSelect constant', () => {
    expect(prism.find(livePaletteConnectSelect).exists()).toBe(true)
  })
})
