import React from 'react'
import { Link } from 'react-router-dom'
import { shallow } from 'enzyme'
import SimilarColorSwatch from 'src/components/Facets/ColorDetails/SimilarColors/SimilarColorSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import ReactGA from 'react-ga'

const color = Colors.getColor()
let colors = []

const similarColorSwatch = (color) => {
  return shallow(<SimilarColorSwatch color={color} />)
}

Object.keys(color).filter((el) => {
  if (el === 'colorNumber' || el === 'name' || el === 'brandKey') {
    colors.push(color[el].toString())
  }
})

describe('Color Swatch component will pass props correctly', () => {
  const wrapper = similarColorSwatch(color)

  it('snapshot testing', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('component will be rendering', () => {
    const colorSwatchExist = wrapper.exists()
    expect(colorSwatchExist).toEqual(true)
  })

  it('component will rendering color swatch data inside of component', () => {
    wrapper.find('span').forEach((el) => {
      const colorExist = colors.includes(el.text())
      expect(colorExist).toEqual(true)
    })
    expect(colors.includes(wrapper.find('p').text())).toEqual(true)
  })
})

// event behavior test
describe(('click event test of color swatch component'), () => {
  const wrapper = similarColorSwatch(color)
  it('component should call handclick function', () => {
    const handleClickMock = jest.fn()
    ReactGA.event = handleClickMock
    wrapper.find(Link).simulate('click')
    expect(ReactGA.event).toHaveBeenCalled()
  })
})
