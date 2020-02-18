import React from 'react'
import InspiredSceneNavigator from 'src/components/InspirationPhotos/InspiredSceneNavigator'
import Carousel from 'src/components/Carousel/Carousel'
import ColorCollectionsTab from 'src/components/Shared/ColorCollectionsTab'

let defaultProps = {
  collectionTabs: [],
  flatData: [],
  loadData: () => null,
  setHeader: jest.fn(),
  tabMap: {}
}

describe('Testing state for InspiredSceneNavigator component', () => {
  let inspiredSceneNavigator

  beforeAll(() => {
    // eslint-disable-next-line no-undef
    inspiredSceneNavigator = mocked(<InspiredSceneNavigator {...defaultProps} />)
  })

  it('State should initialize correctly', () => {
    expect(inspiredSceneNavigator.find(ColorCollectionsTab).props().tabIdShow).toEqual('tab0')
  })

  it('should rendering ImageScenesWithCarousel Component', () => {
    expect(inspiredSceneNavigator.find(Carousel).exists()).toBe(true)
  })
})
