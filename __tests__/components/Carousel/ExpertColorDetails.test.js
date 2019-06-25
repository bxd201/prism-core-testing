import React from 'react'
import { shallow } from 'enzyme'
import { ExpertColorDetails } from 'src/components/Carousel/ExpertColorDetails'
import { expertColorsData } from 'src/components/Carousel/data'
import cloneDeep from 'lodash/cloneDeep'

const baseClass = 'prism-expert-color-details'

const createExpertColorDetails = (props = {}) => {
  return shallow(<ExpertColorDetails {...props} />)
}
const props = { 'expertColors': cloneDeep(expertColorsData[0]),
  'addColors': [cloneDeep(expertColorsData[0][0])] }

const wrapper = createExpertColorDetails(props)

describe('snapshot match testing', () => {
  expect(wrapper).toMatchSnapshot()
})

describe('CollectionSummary should rendering correctly with different props', () => {
  it('should rendering component wrapper', () => {
    expect(wrapper.find(`${baseClass}__content__wrapper`)).toBeTruthy()
  })
  it('should rendering color number', () => {
    expect(wrapper.find(`${baseClass}__content__wrapper__color-number`)).toBeTruthy()
  })
  it('should rendering header', () => {
    expect(wrapper.find(`${baseClass}__header`)).toBeTruthy()
  })
  it('should rendering top section', () => {
    expect(wrapper.find(`${baseClass}__top__section`)).toBeTruthy()
  })
  it('should rendering bottom list', () => {
    expect(wrapper.find(`${baseClass}__bottom__section`)).toBeTruthy()
  })
})
