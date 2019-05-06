import React from 'react'
import { mount } from 'enzyme'
import ColorsFromImage from 'src/components/ColorsFromImage/ColorsFromImage'
import ColorsFromImagePin from 'src/components/ColorsFromImage/ColorsFromImagePin'
import { brandColors } from 'src/components/ColorsFromImage/sw-colors-in-LAB.js'

const createColorsFromImage = (props) => {
  return mount(<ColorsFromImage {...props} />)
}

describe('snapshot testing', () => {
  it('should match snaphshot', () => {
    const wrapper = createColorsFromImage()
    expect(wrapper).toMatchSnapshot()
  })
})

describe('color from image compoment rendring test', () => {
  const wrapper = createColorsFromImage()
  it('should rendering colorFromImagePin Component', () => {
    expect(wrapper.find(ColorsFromImagePin).exists()).toBe(true)
  })

  it('should rendering canvas correctly', () => {
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})

// canvas testing
describe('canvas testing', () => {
  const wrapper = createColorsFromImage()
  it('event mousemove should be called when mouse move', () => {
    const canvasWrapper = wrapper.find('div').at(1)
    const spy = jest.fn()
    wrapper.instance().updatePreviewPin = spy
    canvasWrapper.simulate('mousemove')
    wrapper.instance().forceUpdate()
    expect(spy).toHaveBeenCalled()
  })

  it('should update state correctly', () => {
    const canvas = wrapper.instance()
    expect(canvas.state.imageStatus).toEqual('loading')
    canvas.handleImageLoaded()
    expect(canvas.state.imageStatus).toEqual('loaded')
    canvas.handleImageErrored()
    expect(canvas.state.imageStatus).toEqual('failed')
  })

  it('should rendring canvas correctly', () => {
    const canvas = wrapper.instance()
    const R = Math.floor(Math.random() * 255 + 1)
    const G = Math.floor(Math.random() * 255 + 1)
    const B = Math.floor(Math.random() * 255 + 1)
    const color = [R, G, B]

    expect(canvas.brandColorsLength).toEqual(brandColors.length)
    expect(canvas.canvasHeight).toEqual(487)
    expect(canvas.canvasWidth).toEqual(898)
    expect(Array.isArray(canvas.rgb2lab(color))).toBe(true)
  })
})
