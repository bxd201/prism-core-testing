import React from 'react'
import { shallow } from 'enzyme'
import { ActiveSlot } from 'src/components/LivePalette/ActiveSlot'
import * as Colors from '__mocks__/data/color/Colors'

const colors = Colors.getColor()
const defaultProp = {
  color: colors,
  connectDragSource: jest.fn((el) => el),
  connectDropTarget: jest.fn((el) => el)
}

const createActiveSlot = (props) => {
  return shallow(<ActiveSlot {...defaultProp} {...props} />)
}

// snapshot testing
describe('snapshot testing for activeslot component ', () => {
  it('ActiveSlot component should match snapshot', () => {
    const wrapper = createActiveSlot()
    expect(wrapper).toMatchSnapshot()
  })
})

// rendering testing
describe('rendering testing for activeslot compoenent', () => {
  it('activeslot component should rendering correctly with colors', () => {
    const wrapper = createActiveSlot()
    expect(wrapper.find('.prism-live-palette__slot').exists()).toBe(true)
    expect(wrapper.find('.prism-live-palette__color-details').exists()).toBe(true)
    expect(wrapper.find('.prism-live-palette__color-number').exists()).toBe(true)
    expect(wrapper.find('.prism-live-palette__color-name').exists()).toBe(true)
    expect(wrapper.find('.prism-live-palette__color-description').exists()).toBe(true)
    expect(wrapper.find('.prism-live-palette__trash').exists()).toBe(true)
  })
})

// event test
describe('Event testing for activeslot component', () => {
  it('onClick and activating the swatch should be invoked if its not already active', () => {
    const spy = jest.fn()
    const wrapper = createActiveSlot({ active: false, onClick: spy })
    wrapper.find('.prism-live-palette__slot').simulate('click')
    expect(spy).toHaveBeenCalledWith(colors)
  })

  it('onClick and activating the swatch should not be invoked if its already active', () => {
    const spy = jest.fn()
    const wrapper = createActiveSlot({ active: true, onClick: spy })
    wrapper.find('.prism-live-palette__slot').simulate('click')
    expect(spy).not.toHaveBeenCalledWith(colors)
  })

  it('remove function should be invoked if click remove button', () => {
    const spy = jest.fn()
    const wrapper = createActiveSlot({ remove: spy })
    wrapper.find('.prism-live-palette__trash').simulate('click')
    setTimeout(() => { expect(spy).toHaveBeenCalledWith(colors.id) }, 300)
  })
})
