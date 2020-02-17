import React from 'react'
import { ColorDetails } from 'src/components/Facets/ColorDetails/ColorDetails'
import * as Colors from '__mocks__/data/color/Colors'

// Rendering testing
describe('Testing props pass ccorrectly for color details component', () => {
  let colorDetails

  beforeAll(() => {
    // eslint-disable-next-line no-undef
    colorDetails = mocked(<ColorDetails />, {
      routeParams: { colorId: '1544' },
      mockedStoreValues: {
        colors: { items: { colorMap: Colors.getAllColors() } }
      }
    })
  })

  it('matches snapshot', () => {
    expect(colorDetails).toMatchSnapshot()
  })

  it('ColorDetails exists', () => {
    expect(colorDetails.find('div.color-detail-view').exists()).toBe(true)
  })

  it('ColorViewer exists', () => {
    expect(colorDetails.find('ColorViewer').exists()).toBe(true)
  })

  it('SceneManager exists', () => {
    expect(colorDetails.find('div.color-detail__scene-wrapper').exists()).toBe(true)
  })

  it('ColorStrip exists', () => {
    expect(colorDetails.find('div.color-info__main-info').exists()).toBe(true)
  })

  it('CoordinatingColors exists', () => {
    expect(colorDetails.find('CoordinatingColors').exists()).toBe(true)
  })

  it('SimilarColors exists', () => {
    colorDetails.find('Tab.similar-colors-tab').simulate('click')
    expect(colorDetails.find('SimilarColors').exists()).toBe(true)
  })

  it('Color Info exists', () => {
    colorDetails.find('Tab.color-info-tab').simulate('click')
    expect(colorDetails.find('ColorInfo').exists()).toBe(true)
  })
})
