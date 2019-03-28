import React from 'react'
import { shallow } from 'enzyme'
import TintableSceneOverlay from 'src/components/SceneManager/TintableSceneOverlay'

const defaultProps = {
  type: 'LOADING' | 'ERROR' | 'MESSAGE'
}

const createOverlay = (props = {}) => {
  return shallow(<TintableSceneOverlay {...defaultProps} {...props} />)
}

// snapshot testing
describe('Snapshot Testing', () => {
  it('component should match snapshot', () => {
    const wrapper = createOverlay({ type: 'MESSAGE' })
    expect(wrapper).toMatchSnapshot()
  })
})

// rendering test
describe('testing Tintable Scene Overlay', () => {
  it('message should rendering correctly', () => {
    const wrapper = createOverlay({ type: 'MESSAGE', message: 'testing' })
    expect(wrapper.find('span').exists()).toBe(true)
    expect(wrapper.find('span').text()).toEqual('testing')
  })

  it('loader should rendering correctly', () => {
    const wrapper = createOverlay({ type: 'LOADING', loaderColor: 'blue' })
    expect(wrapper.find('CircleLoader').exists()).toBe(true)
  })
})
