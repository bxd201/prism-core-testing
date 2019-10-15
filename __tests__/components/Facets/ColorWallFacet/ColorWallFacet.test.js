/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Route, Switch } from 'react-router-dom'
import { ColorWallFacet, RootRedirectColorWall, ColorWallComponent } from 'src/components/Facets/ColorWallFacet/ColorWallFacet'
import { ROUTE_PARAMS } from 'constants/globals'

const homeRoute = '/'
const colorWallBaseUrl = `/${ROUTE_PARAMS.ACTIVE}/${ROUTE_PARAMS.COLOR_WALL}`
const colorWallUrlPattern = `${colorWallBaseUrl}(/.*)?`
const locationProp = { pathname: homeRoute }

const getColorWallFacet = (props) => {
  let defaultProps = {
    location: locationProp
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorWallFacet {...newProps} />)
}

describe('ColorWallFacet routes', () => {
  let colorWallFacet
  let pathMap = {}
  beforeAll(() => {
    if (!colorWallFacet) {
      colorWallFacet = getColorWallFacet()
    }

    pathMap = colorWallFacet.find(Route).reduce((pathMap, route) => {
      const routeProps = route.props()
      pathMap[routeProps.path] = routeProps.component
      return pathMap
    }, {})
  })

  it('should match snapshot', () => {
    expect(colorWallBaseUrl).toMatchSnapshot()
  })

  it('should render Switch component', () => {
    expect(colorWallFacet.find(Switch).exists()).toBe(true)
  })

  it('should render Switch component with location prop defined as locationProp constant', () => {
    expect(colorWallFacet.find(Switch).prop('location')).toEqual(locationProp)
  })

  it('should have 2 Route components', () => {
    expect(colorWallFacet.find(Route)).toHaveLength(2)
  })

  it('should show RootRedirectColorWall component for route defined as homeRoute constant', () => {
    expect(pathMap[homeRoute]).toBe(RootRedirectColorWall)
  })

  it('should show ColorWallComponent component for route defined as colorWallUrlPattern constant', () => {
    expect(pathMap[colorWallUrlPattern]).toBe(ColorWallComponent)
  })
})
