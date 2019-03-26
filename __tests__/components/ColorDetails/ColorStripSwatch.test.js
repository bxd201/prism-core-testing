import React from 'react'
import { shallow } from 'enzyme'
import { ColorStripSwatch } from 'src/components/Facets/ColorDetails/ColorStrip/ColorStripSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import ReactGA from 'react-ga'

const color = Colors.getColor()
const active = true
const historyMock = { push: jest.fn() }

const colorStripSwatch = (color) => {
  return shallow(<ColorStripSwatch color={color} history={historyMock} active={active} />)
}

// rendering test
describe('Coordinary Color Swatch component will pass props correctly', () => {
  const wrapper = colorStripSwatch(color)
  it('snapshot testing', () => {
    expect(wrapper).toMatchSnapshot()
  })

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
    ReactGA.event = handleClickMock
    wrapper.find('button').simulate('click')
    expect(ReactGA.event).toHaveBeenCalled()
    expect(historyMock.push).toHaveBeenCalled()
  })
})
