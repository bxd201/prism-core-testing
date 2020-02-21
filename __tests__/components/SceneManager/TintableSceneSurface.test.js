import React from 'react'
import { shallow } from 'enzyme'
import TintableSceneSurface from 'src/components/SceneManager/TintableSceneSurface'

const defaultProps = {
  width: '100px',
  height: '100px'
}

const createSurface = (props = {}) => {
  return shallow(<TintableSceneSurface {...defaultProps} {...props} />)
}

// rendering test
describe('testing Tintable Surface', () => {
  it('SVG should rendering correctly', () => {
    const wrapper = createSurface()
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('image should rendering correctly when type is room', () => {
    const wrapper = createSurface({ type: 'rooms' })
    expect(wrapper.find('image').exists()).toBe(true)
  })

  it('rect should rendering correctly when type is automobile', () => {
    const wrapper = createSurface({ type: 'automotive' })
    expect(wrapper.find('rect').exists()).toBe(true)
  })
})
