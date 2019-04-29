import React from 'react'
import { shallow } from 'enzyme'
import { LivePalette } from 'src/components/LivePalette/LivePalette'
import * as Colors from '__mocks__/data/color/Colors'
import cloneDeep from 'lodash/cloneDeep'
import EmptySlot from 'src/components/LivePalette/EmptySlot'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import { Link } from 'react-router-dom'

const activeSlotHOC = 'Connect(DragSource(DropTarget(ActiveSlot)))'
const colors = Colors.getlpColors()
const defaultProps = cloneDeep(colors)

const createLivePalette = (props = {}) => {
  return shallow(<LivePalette {...defaultProps} {...props} />)
}

// snapshot testing
describe('snapshot testing for LivePalette component ', () => {
  it('LivePalette component should match snapshot', () => {
    const wrapper = createLivePalette()
    expect(wrapper).toMatchSnapshot()
  })
})

// rendering test
describe('rendering testing for LivePalette component ', () => {
  it('LivePalette component rendering correctly', () => {
    const wrapper = createLivePalette()
    expect(wrapper.find('.prism-live-palette').length).toBeGreaterThan(0)
  })

  it('LivePalette should rendering numbers of active slots correctly', () => {
    const wrapper = createLivePalette()
    const activeSlotCount = wrapper.find(activeSlotHOC).length

    if (activeSlotCount > 0) {
      expect(activeSlotCount).toBeGreaterThan(0)
      if (activeSlotCount > LP_MAX_COLORS_ALLOWED) {
        expect(activeSlotCount).toEqual(LP_MAX_COLORS_ALLOWED)
      }
    } else {
      expect(activeSlotCount).toEqual(0)
    }
  })

  it('LivePalette should rendering numbers of Empty slots correctly', () => {
    const wrapper = createLivePalette()
    const isHaveEmptySlot = (LP_MAX_COLORS_ALLOWED - 1) - wrapper.find(activeSlotHOC).length
    const emptySlotCount = wrapper.find(EmptySlot).length

    if (isHaveEmptySlot > 0) {
      expect(emptySlotCount).toBeGreaterThan(0)
    } else {
      expect(emptySlotCount).toEqual(0)
    }
  })

  it('LivePalette should rendering numbers of Link correctly', () => {
    const wrapper = createLivePalette()
    const countLinks = wrapper.find(Link).length
    if (defaultProps.colors.length < LP_MAX_COLORS_ALLOWED) {
      expect(countLinks).toBeGreaterThan(0)
    } else {
      expect(countLinks).toEqual(0)
    }
  })
})

// event test
describe('event testing for LivePalette componenet', () => {
  it('onClick function of activeSlotHOC should be called with parameter colors', () => {
    const spy = jest.fn()
    const wrapper = createLivePalette({ activateColor: spy })
    wrapper.find(activeSlotHOC).forEach((el, index) => {
      el.simulate('click')
      expect(spy).toBeCalled()
    })
  })
})
