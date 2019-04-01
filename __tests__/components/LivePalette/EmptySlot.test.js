import React from 'react'
import { shallow } from 'enzyme'
import EmptySlot from 'src/components/LivePalette/EmptySlot'

const createEmptySlot = () => {
  return shallow(<EmptySlot />)
}

// snapshot testing
describe('snapshot testing for emptyslot component ', () => {
  it('emptySlot component should match snapshot', () => {
    const wrapper = createEmptySlot()
    expect(wrapper).toMatchSnapshot()
  })
})

// rendering test
describe('rendering testing for emptyslot component ', () => {
  it('emptySlot component rendering correctly', () => {
    const wrapper = createEmptySlot()
    expect(wrapper.find('div').length).toBeGreaterThan(0)
  })
})
