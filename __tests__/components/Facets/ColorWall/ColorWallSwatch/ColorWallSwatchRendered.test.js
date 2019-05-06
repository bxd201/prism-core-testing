/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ColorWallSwatchRenderer from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchRenderer'

const getColorWallSwatchRenderer = (props) => {
  return shallow(<ColorWallSwatchRenderer {...props} />)
}

describe('snapshot test', () => {
  const ColorWallSwatchRenderer = getColorWallSwatchRenderer()
  it('ColorWallSwatchRenderer should match the Snapshot', () => {
    expect(ColorWallSwatchRenderer).toMatchSnapshot()
  })
})
