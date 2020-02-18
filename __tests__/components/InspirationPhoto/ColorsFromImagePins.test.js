import React from 'react'
import { shallow } from 'enzyme'
import { ColorsFromImagePin } from 'src/components/InspirationPhotos/ColorsFromImagePin'
import { LiveMessage } from 'react-aria-live'

const mockFn = jest.fn()
let defaultProps = {
  activedPins: mockFn,
  isActiveFlag: true,
  isContentLeft: true,
  translateX: 0,
  translateY: 0,
  RGBstring: '',
  previewColorName: '',
  previewColorNumber: '0001',
  pinNumber: 0,
  addColors: [],
  addToLivePalette: mockFn,
  handleDrag: mockFn,
  deleteCurrentPin: mockFn,
  handleDragStop: mockFn,
  handlePinMoveByKeyboard: mockFn,
  handleKeyUpAfterPinMove: mockFn,
  hide: true,
  isMovingPin: true
}

const createColorsFromImagePin = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorsFromImagePin {...newProps} />, { disableLifecycleMethods: true })
}

const wrapper = createColorsFromImagePin()
const drag = jest.fn()
const mouseDown = jest.fn()
const blur = jest.fn()
const focus = jest.fn()
const keyUp = jest.fn()
const button = `[role='button']`

describe('Testing state for createColorsFromImage Pins component', () => {
  it('State should initialize correctly', () => {
    const initialState = wrapper.instance().state
    expect(initialState).toEqual({
      isColorDivFocused: true
    })
  })
})

describe('compoments rendring test', () => {
  it('should rendering ColorsFromImagePin Component when it active', () => {
    expect(wrapper.find('.pin__wrapper--active').exists()).toBe(true)
  })

  it('should rendering Colors From Image pins', () => {
    expect(wrapper.find('.pin__content__wrapper').exists()).toBe(true)
  })

  it('should rendering LiveMessage', () => {
    const previewColorName = wrapper.instance().props.previewColorName
    const component = wrapper.find(LiveMessage).at(0)
    expect(component.prop('message')).toEqual(`Color ${previewColorName} is active. Press tab to go to other color pins`)
  })

  it('should rendering LiveMessage focus Message', () => {
    const component = wrapper.find(LiveMessage).at(1)
    expect(component.prop('message')).toEqual('Use the arrow keys on your keyboard to move your picked color. Hold shift for fine movement.')
  })
})

describe('component event test', () => {
  it('click pin should works fine', () => {
    const click = jest.fn()
    wrapper.instance().onClickHandlerLabel = click
    wrapper.instance().forceUpdate()
    wrapper.find('.pin__wrapper--active').simulate('click')
    expect(click).toHaveBeenCalled()
  })

  it('pins should be dragable', () => {
    wrapper.instance().handleDragStart = drag
    wrapper.instance().forceUpdate()
    wrapper.find(button).simulate('dragStart')
    expect(drag).toHaveBeenCalled()
  })

  it('pins should be clickable', () => {
    wrapper.instance().handleMouseDown = mouseDown
    wrapper.instance().forceUpdate()
    wrapper.find(button).simulate('mouseDown')
    expect(mouseDown).toHaveBeenCalled()
  })

  it('pins should be handled by keyboard', () => {
    wrapper.instance().handleKeyUpDiv = keyUp
    wrapper.instance().forceUpdate()
    wrapper.find(button).simulate('keyUp')
    expect(keyUp).toHaveBeenCalled()
  })

  it('pins could be blur', () => {
    wrapper.instance().blurHandler = blur
    wrapper.instance().forceUpdate()
    wrapper.find(button).simulate('blur')
    expect(blur).toHaveBeenCalled()
  })

  it('pins could be focus', () => {
    wrapper.instance().focusHandler = focus
    wrapper.instance().forceUpdate()
    wrapper.find(button).simulate('focus')
    expect(focus).toHaveBeenCalled()
  })
})
