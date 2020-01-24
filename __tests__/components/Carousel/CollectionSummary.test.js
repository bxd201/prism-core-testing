import React from 'react'
import { shallow } from 'enzyme'
import ListWithCarousel from 'src/components/Carousel/Carousel'
import CollectionSummary from 'src/components/ColorCollections/CollectionSummary'

const baseClass = 'collection__summary'

const createCollectionSummary = (props = {}) => {
  const CollectionSummaryWrapper = ListWithCarousel(CollectionSummary)
  return shallow(<CollectionSummaryWrapper {...props} />)
}

const wrapper = createCollectionSummary({ isExpertColor: true, getSummaryData: jest.fn(), data: [] })
const collectionWrapper = createCollectionSummary({ isExpertColor: false, getSummaryData: jest.fn(), data: [] })

describe('snapshot match testing', () => {
  expect(wrapper).toMatchSnapshot()
})

describe('CollectionSummary should rendering correctly with different props', () => {
  it('should rendering component wrapper', () => {
    expect(wrapper.find(`${baseClass}__wrapper`)).toBeTruthy()
  })
  it('should rendering top section correctly', () => {
    expect(wrapper.find(`${baseClass}__top-section`)).toBeTruthy()
  })
  it('should rendering name correctly', () => {
    expect(wrapper.find(`${baseClass}__content__wrapper__color-number`)).toBeTruthy()
  })
  it('should rendering color nubmer correctly', () => {
    expect(wrapper.find(`${baseClass}__content__wrapper__color-name`)).toBeTruthy()
  })
  it('should rendering bottom list', () => {
    expect(wrapper.find(`${baseClass}__bottom-list`)).toBeTruthy()
  })
  it('should rendering image', () => {
    expect(collectionWrapper.find(`${baseClass}__top-section__image`)).toBeTruthy()
  })
  it('should collection name', () => {
    expect(collectionWrapper.find(`${baseClass}__collection-name`)).toBeTruthy()
  })
})
