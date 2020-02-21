import React from 'react'
import { Link } from 'react-router-dom'
import { shallow } from 'enzyme'
import CoordinatingColorSwatch from 'src/components/Facets/ColorDetails/CoordinatingColors/CoordinatingColorSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import * as GA from 'src/analytics/GoogleAnalytics'

const color = Colors.getColor()
let colors = [color.name, `${color.brandKey} ${color.colorNumber}`]

const coordinatingColorSwatch = (color) => {
  return shallow(<CoordinatingColorSwatch color={color} />)
}

describe('Coordinary Color Swatch component will pass props correctly', () => {
  const wrapper = coordinatingColorSwatch(color)

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
    GA.event = jest.fn()
    wrapper.find(Link).simulate('click')
    expect(GA.event).toHaveBeenCalled()
  })
})
