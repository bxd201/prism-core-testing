/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ColorsFromImagePin from 'src/components/ColorsFromImage/ColorsFromImagePin'

const pinChipClass = 'pin__chip'
const pinNameWrapperClass = 'pin__name-wrapper'
const pinNameClass = 'pin__name'
const pinNumberClass = 'pin__number'
const isActiveClass = 'pin--active__wrapper'
const previewColorName = 'Heartthrob'
const previewColorNumber = '6866'
const onClickMethodMock = jest.fn()

const getColorsFromImagePin = (props) => {
  let defaultProps = {
    RGBstring: 'rgb(0,0,0)',
    isActiveFlag: false,
    onClickMethod: onClickMethodMock,
    pinType: 'preview',
    previewColorName: '',
    previewColorNumber: '',
    transformValue: 'translate(0px, 0px)'
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ColorsFromImagePin {...newProps} />)
}

describe('colorsFromImagePin with props', () => {
  let colorsFromImagePin

  beforeAll(() => {
    if (!colorsFromImagePin) {
      colorsFromImagePin = getColorsFromImagePin()
    }
  })

  it('should match snapshot', () => {
    expect(colorsFromImagePin).toMatchSnapshot()
  })

  it('should render button', () => {
    expect(colorsFromImagePin.find('button').exists()).toBe(true)
  })

  it('should render span with class name defined as pinChipClass constant', () => {
    const spanSelect = `span.${pinChipClass}`
    expect(colorsFromImagePin.find(spanSelect).exists()).toBe(true)
  })

  it('should render div with class name defined as pinNameWrapperClass constant', () => {
    const divSelect = `div.${pinNameWrapperClass}`
    expect(colorsFromImagePin.find(divSelect).exists()).toBe(true)
  })

  it('should render span with class name defined as pinNameClass constant', () => {
    const spanSelect = `span.${pinNameClass}`
    expect(colorsFromImagePin.find(spanSelect).exists()).toBe(true)
  })

  it('should render span with class name defined as pinNumberClass constant', () => {
    const spanSelect = `span.${pinNumberClass}`
    expect(colorsFromImagePin.find(spanSelect).exists()).toBe(true)
  })

  it('should render button with class name defined as isActiveClass constant when prop isActiveFlag is true', () => {
    colorsFromImagePin.setProps({ isActiveFlag: true })
    expect(colorsFromImagePin.find('button').hasClass(isActiveClass)).toBe(true)
  })
})

describe('ColorsFromImagePin with previewColorName & previewColorNumber', () => {
  let colorsFromImagePin

  beforeAll(() => {
    if (!colorsFromImagePin) {
      colorsFromImagePin = getColorsFromImagePin({ previewColorName: previewColorName, previewColorNumber: previewColorNumber })
    }
  })

  it('should match snapshot', () => {
    expect(colorsFromImagePin).toMatchSnapshot()
  })

  it('should render span with color name if previewColorName prop is not empty', () => {
    const spanSelect = `span.${pinNameClass}`
    if(previewColorName !== '')
      expect(colorsFromImagePin.find(spanSelect).text()).toEqual(previewColorName)
  })

  it('should render span with color number if previewColorNumber prop is not empty', () => {
    const spanSelect = `span.${pinNumberClass}`
    const spanText = `SW ${previewColorNumber}`
    expect(colorsFromImagePin.find(spanSelect).text()).toEqual(spanText)
  })
})

describe('ColorsFromImagePin with events', () => {
  let colorsFromImagePin

  beforeAll(() => {
    if (!colorsFromImagePin) {
      colorsFromImagePin = getColorsFromImagePin()
    }
  })

  it('should call onClickMethodMock when button is clicked', () => {
    colorsFromImagePin.find('button').simulate('click')
    expect(onClickMethodMock).toHaveBeenCalled()
  })
})
