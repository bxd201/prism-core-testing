/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ColorStrip } from 'src/components/Facets/ColorDetails/ColorStrip/ColorStrip'
import * as Colors from '__mocks__/data/color/Colors'
import split from 'lodash/split'

const color = Colors.getColor()
const colors = Colors.getAllColors()
const historyMock = { push: jest.fn() }

const BASE_CLASS = 'color-info'

const getColorStrip = (props) => {
  return shallow(<ColorStrip {...props} />)
}

describe('ColorStrip component with empty props', () => {
  let colorStrip
  beforeEach(() => {
    if (!colorStrip) {
      colorStrip = getColorStrip({ color: [], colors: [], history: historyMock })
    }
  })

  it('ColorStrip is rendering with empty props', () => {
    expect(colorStrip.exists()).toBe(true)
  })
})

describe('ColorStrip component with props', () => {
  let colorStrip
  beforeEach(() => {
    if (!colorStrip) {
      colorStrip = getColorStrip({ colors: colors, color: color, history: historyMock })
    }
  })

  it('ColorStrip is rendering', () => {
    expect(colorStrip.exists()).toBe(true)
  })

  it('ColorStrip is rendering strip location name', () => {
    const stripLocationNameSpan = `span.${BASE_CLASS}__strip-location-name`
    expect(colorStrip.find(stripLocationNameSpan).contains(split(color.storeStripLocator, '-')[0])).toBeTruthy()
  })
})
