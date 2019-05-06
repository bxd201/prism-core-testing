/* eslint-env jest */
import React from 'react'
import { shallow, mount } from 'enzyme'
import ColorWallSwatch from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatch'
import * as Colors from '__mocks__/data/color/Colors'
import { Link } from 'react-router-dom'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'
import { fullColorName } from 'src/shared/helpers/ColorUtils'
import AddButton from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/AddButton'

const color = Colors.getColor()
const clickFn = jest.fn()

const defaultProps = {
  color: color,
  focus: false,
  thisLink: '',
  detailsLink: '',
  showContents: false,
  onAdd: clickFn,
  onClick: clickFn,
  active: false
}

const getColorWallSwatch = (props = {}) => {
  return shallow(<ColorWallSwatch {...defaultProps} {...props} />)
}
const getDeepMountColorWallSwatch = (props = {}) => {
  const config = { displayInfoButton: true }
  return mount(<ColorWallContext.Provider value={config}>
    <ColorWallSwatch {...defaultProps} {...props} />
  </ColorWallContext.Provider>)
}

describe('snapshot test', () => {
  const ColorWallSwatch = getColorWallSwatch()
  it('ColorWallSwatch should match the Snapshot', () => {
    expect(ColorWallSwatch).toMatchSnapshot()
  })
})

describe('rendering test', () => {
  it('ColorWallSwatch should render color title as default', () => {
    expect(typeof fullColorName(color.brandKey, color.colorNumber, color.name)).toBe('string')
  })
  it('ColorWallSwatch should rendering buttons correctly when props showContents equal to true', () => {
    const ColorWallSwatch = getColorWallSwatch({ showContents: true })
    expect(ColorWallSwatch.find(ColorWallContext.Consumer).exists()).toBe(true)
  })
  it('ColorWallSwatch should rendering Link correctly when props thislink is not equal to null', () => {
    const ColorWallSwatch = getColorWallSwatch({ thisLink: 'test' })
    expect(ColorWallSwatch.find(Link).exists()).toBe(true)
  })
})

describe('event test', () => {
  it('AddButton should working fine', () => {
    const ColorWallSwatch = getDeepMountColorWallSwatch({ showContents: true })
    ColorWallSwatch.find(AddButton).props().onClick()
    expect(clickFn).toHaveBeenCalled()
  })
  it('Link component should work fine', () => {
    const ColorWallSwatch = getColorWallSwatch({ thisLink: 'test' })
    ColorWallSwatch.find(Link).simulate('click')
    expect(clickFn).toHaveBeenCalled()
  })
})
