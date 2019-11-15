/* eslint-env jest */

import React from 'react'
// import { shallow } from 'enzyme'
import { mountWithIntl } from '__mocks__/helpers/intl'
import SceneVariantSwitch, { CLASSES } from 'src/components/SceneManager/SceneVariantSwitch'

const BASE = CLASSES.BASE
const NIGHT = `${BASE}--night`
const labelSelect = `label.${BASE}`
const inputSelect = `${labelSelect} input`
const labelNightSelect = `label.${NIGHT}`
const WRAPPER = `${BASE}__wrapper`
const wrapperNightDiv = `div.${WRAPPER}--night`
const fontAwesomeIconDiv = `div.${WRAPPER}`
const fontAwesomeIconDivActive = `${WRAPPER}--active`
const mockFn = jest.fn()

const getSceneVariantSwitch = (props) => {
  let defaultProps = {
    sceneId: 1,
    currentVariant: 'night',
    onChange: mockFn
  }

  let newProps = Object.assign({}, defaultProps, props)
  return mountWithIntl(<SceneVariantSwitch.DayNight {...newProps} />)
}

describe('SceneVariantSwitch component with props', () => {
  let sceneVariantSwitch
  beforeEach(() => {
    if (!sceneVariantSwitch) {
      sceneVariantSwitch = getSceneVariantSwitch()
    }
  })

  it('should match snapshot', () => {
    expect(sceneVariantSwitch).toMatchSnapshot()
  })

  it('should render label', () => {
    expect(sceneVariantSwitch.find(labelSelect).exists()).toBe(true)
  })

  it('should render label with class name scene-variant-switch-day-night--night if currentVariant is night', () => {
    if (sceneVariantSwitch.find('DayNight').prop('currentVariant') === 'night') { expect(sceneVariantSwitch.find(labelNightSelect).exists()).toBe(true) }
  })

  it('should render checkbox', () => {
    expect(sceneVariantSwitch.find(inputSelect).exists()).toBe(true)
  })

  it('should render two divs with FontAwesomeIcon', () => {
    expect(sceneVariantSwitch.find(fontAwesomeIconDiv)).toHaveLength(2)
  })

  it('should render night div with FontAwesomeIcon with class name scene-variant-switch-day-night__wrapper--active', () => {
    if (sceneVariantSwitch.find('DayNight').prop('currentVariant') !== 'night') { expect(sceneVariantSwitch.find(wrapperNightDiv).hasClass(fontAwesomeIconDivActive)).toBe(true) }
  })
})

describe('SceneVariantSwitch events', () => {
  let sceneVariantSwitch
  beforeEach(() => {
    if (!sceneVariantSwitch) {
      sceneVariantSwitch = getSceneVariantSwitch()
    }
  })

  it('should call onchange on keydown event with keycode 32 for label', () => {
    sceneVariantSwitch.find(labelSelect).simulate('keyDown', { keyCode: 32 })
    expect(mockFn).toHaveBeenCalled()
  })

  it('should call onchange on keydown event with keycode 13 for label', () => {
    sceneVariantSwitch.find(labelSelect).simulate('keyDown', { keyCode: 13 })
    expect(mockFn).toHaveBeenCalled()
  })

  it('should call mockFn on change event for checkbox', () => {
    sceneVariantSwitch.find(inputSelect).simulate('change')
    expect(mockFn).toHaveBeenCalled()
  })
})
