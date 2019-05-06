import React from 'react'
import { shallow } from 'enzyme'
import { TintableSceneHitArea } from 'src/components/SceneManager/TintableSceneHitArea'

const defaultProps = {
  connectDropTarget: jest.fn((el) => el),
  onDrop: jest.fn(),
  onClick: jest.fn(),
  onOver: jest.fn(),
  onOut: jest.fn(),
  onLoadingSuccess: jest.fn(),
  onLoadingError: jest.fn()
}

const createHitArea = (props = {}) => {
  return shallow(<TintableSceneHitArea {...defaultProps} {...props} />)
}

// snapshot testing
describe('Snapshot Testing', () => {
  it('component should match snapshot', () => {
    const wrapper = createHitArea()
    expect(wrapper).toMatchSnapshot()
  })
})

// rendering test
describe('testing Tintable Scene hit area', () => {
  it('SVG should rendering correctly', () => {
    const wrapper = createHitArea()
    expect(wrapper.find('InlineSVG').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})

// event test
describe('event testing', () => {
  it('click function should be called correctly', () => {
    const wrapper = createHitArea()
    const click = jest.fn()
    wrapper.instance().handleClick = click
    wrapper.instance().forceUpdate()
    wrapper.find('use').simulate('click')
    expect(click).toHaveBeenCalled()
  })
})
