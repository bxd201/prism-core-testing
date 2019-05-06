/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ColorWallSwatchUI from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchUI'
import * as Colors from '__mocks__/data/color/Colors'
import { Link } from 'react-router-dom'
const color = Colors.getColor()

const defaultProps = {
  color: color,
  thisLink: '',
  focus: true,
  onClick: jest.fn()
}
const getColorWallSwatchUI = (props = {}) => {
  return shallow(<ColorWallSwatchUI {...defaultProps} {...props} />)
}

describe('snapshot test', () => {
  const wrapper = getColorWallSwatchUI()
  it('ColorWallSwatchUI should match the Snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('rendering test', () => {
  it('should rendring Link correctly with props', () => {
    const wrapper = getColorWallSwatchUI({ thisLink: 'link' })
    expect(wrapper.find(Link).exists()).toEqual(true)
  })
})

describe('event test', () => {
  it('click function will be invoked when link is clicked', () => {
    const wrapper = getColorWallSwatchUI({ thisLink: 'link' })
    wrapper.find(Link).simulate('click')
    expect(wrapper.instance().props.onClick).toHaveBeenCalled()
  })
})
