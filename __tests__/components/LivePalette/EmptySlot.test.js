import React from 'react'
import { shallow } from 'enzyme'
import EmptySlot from 'src/components/LivePalette/EmptySlot'

const createEmptySlot = () => {
  return shallow(<EmptySlot />)
}

// rendering test
describe('rendering testing for emptyslot component ', () => {
  it('emptySlot component rendering correctly', () => {
    const wrapper = createEmptySlot()
    expect(wrapper.find('div').length).toBeGreaterThan(0)
  })
})
