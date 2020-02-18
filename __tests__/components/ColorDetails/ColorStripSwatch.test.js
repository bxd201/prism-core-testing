import React from 'react'
import { shallow } from 'enzyme'
import { ColorStripSwatch } from 'src/components/Facets/ColorDetails/ColorStrip/ColorStripSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import * as GA from 'src/analytics/GoogleAnalytics'

const color = Colors.getColor()
const active = true
const historyMock = { push: jest.fn() }

const colorStripSwatch = (color) => {
  return shallow(<ColorStripSwatch color={color} history={historyMock} active={active} />)
}

// rendering test
describe('Coordinary Color Swatch component will pass props correctly', () => {
  const wrapper = colorStripSwatch(color)

  it('component will be rendering', () => {
    const colorSwatchExist = wrapper.exists()
    expect(colorSwatchExist).toEqual(true)
  })

  it('component will rendering color swatch data inside of component', () => {
    expect(wrapper.find('span').text()).toEqual(color.name)
  })
})

// event behavior test
describe(('click event test of color swatch component'), () => {
  const wrapper = colorStripSwatch(color)
  it('component should call handclick function', () => {
    const handleClickMock = jest.fn()
    GA.event = handleClickMock
    wrapper.find('button').simulate('click')
    expect(GA.event).toHaveBeenCalled()
    expect(historyMock.push).toHaveBeenCalled()
  })
})
