import React from 'react'
import { shallow } from 'enzyme'
import CoordinatingColorSwatch from 'src/components/Facets/ColorDetails/CoordinatingColors/CoordinatingColorSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import ReactGA from 'react-ga'

const color = Colors.getColor()
let colors = [color.name, `${color.brandKey} ${color.colorNumber}`]

const coordinatingColorSwatch = (color) => {
  return shallow(<CoordinatingColorSwatch color={color} />)
}

// rendering test
describe('Coordinary Color Swatch component with props as empty array', () => {
  const wrapper = coordinatingColorSwatch([])

  it('snapshot testing', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('component will be rendering', () => {
    const colorSwatchExist = wrapper.exists()
    expect(colorSwatchExist).toEqual(true)
  })

  it('component will not rendering color data inside of component', () => {
    wrapper.find('p').forEach((el) => {
      const colorExist = colors.includes(el.text())
      expect(colorExist).toEqual(false)
    })
  })
})

describe('Coordinary Color Swatch component will pass props correctly', () => {
  const wrapper = coordinatingColorSwatch(color)

  it('snapshot testing', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('component will be rendering', () => {
    const colorSwatchExist = wrapper.exists()
    expect(colorSwatchExist).toEqual(true)
  })

  it('component will rendering color swatch data inside of component', () => {
    wrapper.find('p').forEach((el) => {
      const colorExist = colors.includes(el.text())
      expect(colorExist).toEqual(true)
    })
  })
})

// event behavior test
describe(('click event test of color swatch component'), () => {
  const wrapper = coordinatingColorSwatch(color)
  it('component should call handclick function', () => {
    const handleClickMock = jest.fn()
    ReactGA.event = handleClickMock
    wrapper.find('Link').simulate('click')
    expect(ReactGA.event).toHaveBeenCalled()
  })
})
