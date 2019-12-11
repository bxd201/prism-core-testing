import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import ColorWall from 'src/components/Facets/ColorWall/ColorWall'
import { facetMasterWrapper } from 'src/facetSupport/facetMasterWrapper'
import ConfigurationContextProvider from 'src/contexts/ConfigurationContext/ConfigurationContextProvider'

test('ColorWall renders without errors', () => {
  // const CWall = facetMasterWrapper(ColorWall)
  // expect(mount(<CWall />)).toBe('asdf')
  // expect(mocked(<ColorWall />).html()).toBe('asdf')
})
