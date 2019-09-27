import React from 'react'
import { shallow } from 'enzyme'
import { InspiredSceneNavigator } from 'src/components/InspirationPhotos/InspiredSceneNavigator'
import ImageScenesWithCarousel from 'src/components/InspirationPhotos/InspiredScene'

let defaultProps = {
  collectionTabs: [],
  flatData: [],
  loadData: () => null,
  setHeader: jest.fn(),
  tabMap: {}

}

const createInspiredSceneNavigator = (props) => {
  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<InspiredSceneNavigator {...newProps} />)
}

const wrapper = createInspiredSceneNavigator()

describe('snapshot match testing', () => {
  it('snapshot testing', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('Testing state for InspiredSceneNavigator component', () => {
  it('State should initialize correctly', () => {
    const initialState = wrapper.instance().state
    expect(initialState).toEqual(expect.objectContaining({
      tabId: 'tab0'
    }))
  })
})

describe('compoments rendring test', () => {
  const wrapper = createInspiredSceneNavigator()
  it('should rendering ImageScenesWithCarousel Component', () => {
    expect(wrapper.find(ImageScenesWithCarousel).exists()).toBe(true)
  })
})
