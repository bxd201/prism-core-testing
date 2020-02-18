/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ImageRotateTerms, {
  wrapperToolsMessageClass,
  wrapperToolsRotateArrowClass,
  wrapperAgreeTermsAcceptClass,
  wrapperAgreeTermsCheckboxLabelClass,
  wrapperAgreeTermsTextClass,
  wrapperAgreeTermsAcceptActiveClass
} from 'src/components/MatchPhoto/ImageRotateTerms'
import CircleLoader from 'src/components/Loaders/CircleLoader/CircleLoader'

const rotateImageMockFn = jest.fn()
const createColorPinsMockFn = jest.fn()
const imageData = {}

const getImageRotateTerms = props => {
  let defaultProps = {
    rotateImage: rotateImageMockFn,
    createColorPins: createColorPinsMockFn,
    imageData: imageData
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<ImageRotateTerms {...newProps} />)
}

describe('ImageRotateTerms with props', () => {
  let imageRotateTerms
  beforeEach(() => {
    if (!imageRotateTerms) {
      imageRotateTerms = getImageRotateTerms()
    }
  })

  it(`should render div.${wrapperToolsMessageClass} with headerContnet`, () => {
    const headerContnet = 'Use these arrows to rotate your image.'
    expect(imageRotateTerms.find(`div.${wrapperToolsMessageClass}`).contains(headerContnet)).toBe(true)
  })

  it(`should render two button.${wrapperToolsRotateArrowClass} buttons`, () => {
    expect(imageRotateTerms.find(`button.${wrapperToolsRotateArrowClass}`)).toHaveLength(2)
  })

  it(`should render button.${wrapperAgreeTermsAcceptClass}`, () => {
    expect(imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptClass}`).exists()).toBe(true)
  })

  it(`should render button.${wrapperAgreeTermsAcceptClass} with buttonContnet`, () => {
    const buttonContnet = 'DONE'
    expect(imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptClass}`).contains(buttonContnet)).toBe(true)
  })

  it(`should render label.${wrapperAgreeTermsCheckboxLabelClass}`, () => {
    expect(imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass}`).exists()).toBe(true)
  })

  it(`should render label.${wrapperAgreeTermsCheckboxLabelClass} with input checkbox`, () => {
    expect(imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).exists()).toBe(true)
  })

  it(`should render span.${wrapperAgreeTermsTextClass}`, () => {
    expect(imageRotateTerms.find(`span.${wrapperAgreeTermsTextClass}`).exists()).toBe(true)
  })

  it(`should render span.${wrapperAgreeTermsTextClass} with spanContent`, () => {
    const spanContent = 'I accept Terms of Use'
    expect(imageRotateTerms.find(`span.${wrapperAgreeTermsTextClass}`).contains(spanContent)).toBe(true)
  })

  it(`should add class ${wrapperAgreeTermsAcceptActiveClass} to button.${wrapperAgreeTermsAcceptClass} when checkbox is checked`, () => {
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
    expect(imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptActiveClass}`).exists()).toBe(true)
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
  })

  it(`should call rotateImageMockFn function when button.${wrapperToolsRotateArrowClass} is clicked`, () => {
    imageRotateTerms.find(`button.${wrapperToolsRotateArrowClass}`).map(el => {
      el.simulate('click')
      expect(rotateImageMockFn).toHaveBeenCalled()
    })
  })

  it(`should call createColorPinsMockFn function when button.${wrapperAgreeTermsAcceptClass} is clicked while checkbox is checked`, () => {
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
    imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptClass}`).simulate('click')
    expect(createColorPinsMockFn).toHaveBeenCalled()
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
  })

  it(`should call createColorPinsMockFn function with prop imageData when button.${wrapperAgreeTermsAcceptClass} is clicked while checkbox is checked`, () => {
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
    imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptClass}`).simulate('click')
    expect(createColorPinsMockFn).toHaveBeenCalledWith(imageData)
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
  })

  it(`should render CircleLoader when button.${wrapperAgreeTermsAcceptClass} is clicked while checkbox is checked`, () => {
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
    imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptClass}`).simulate('click')
    expect(imageRotateTerms.find(CircleLoader).exists()).toBe(true)
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
  })

  it(`should add class ${wrapperAgreeTermsAcceptActiveClass} to button.${wrapperAgreeTermsAcceptClass} when checkbox is checked while space key is pressed on label`, () => {
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass}`).simulate('keyDown', { keyCode: 32, preventDefault: jest.fn() })
    expect(imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptActiveClass}`).exists()).toBe(true)
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
  })

  it(`should add class ${wrapperAgreeTermsAcceptActiveClass} to button.${wrapperAgreeTermsAcceptClass} when checkbox is checked while enter key is pressed on label`, () => {
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass}`).simulate('keyDown', { keyCode: 13, preventDefault: jest.fn() })
    expect(imageRotateTerms.find(`button.${wrapperAgreeTermsAcceptActiveClass}`).exists()).toBe(true)
    imageRotateTerms.find(`label.${wrapperAgreeTermsCheckboxLabelClass} > input`).simulate('change')
  })
})
