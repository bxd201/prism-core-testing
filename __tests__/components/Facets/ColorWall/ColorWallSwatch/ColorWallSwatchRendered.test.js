/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ColorWallSwatchRenderer from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchRenderer'

test('matches snapshot', () => {
  expect(mocked(<ColorWallSwatchRenderer />)).toMatchSnapshot()
})
