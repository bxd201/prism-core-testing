import React from 'react'
import { shallow } from 'enzyme'
import ListWithCarousel from 'src/components/Carousel/Carousel'
import CollectionSummary from 'src/components/ColorCollections/CollectionSummary'

const baseClass = 'prism-slick-carousel'
const contentWrapper = `${baseClass}__wrapper__content`
const createCarousel = (props = {}) => {
  const CollectionSummaryWrapper = ListWithCarousel(CollectionSummary)
  return shallow(<CollectionSummaryWrapper {...props} />)
}
const wrapper = createCarousel({ data: [] })

describe('snapshot match testing', () => {
  expect(wrapper).toMatchSnapshot()
})

describe('Carousel should rendering correctly', () => {
  it('should rendring wrapper component', () => {
    expect(wrapper.find(`${baseClass}__wrapper`)).toBeTruthy()
  })
  it('should rendring buttons correctly', () => {
    expect(wrapper.find(`${contentWrapper}__buttons`)).toBeTruthy()
  })
  it('should rendering child component correctly', () => {
    expect(wrapper.find('collection-list__component')).toBeTruthy()
  })
})

describe('Testing state for carousel component', () => {
  it('State should initialize correctly', () => {
    const initialState = wrapper.instance().state
    expect(initialState).toEqual({
      curr: 0,
      itemsPerView: 8,
      width: window.innerWidth
    })
  })
})

describe('Event tesing for behavoir of carousel component', () => {
  it('Testing for click buttons', () => {
    const nextClick = jest.fn()
    const prevClick = jest.fn()
    wrapper.instance().handleNext = nextClick
    wrapper.instance().handlePrev = prevClick
    wrapper.instance().forceUpdate()
    wrapper.find(`.${contentWrapper}__next-btn__wrapper >.${contentWrapper}__buttons`).simulate('click')
    wrapper.find(`.${contentWrapper}__prev-btn__wrapper >.${contentWrapper}__buttons`).simulate('click')
    expect(nextClick).toHaveBeenCalled()
    expect(prevClick).toHaveBeenCalled()
  })
})
