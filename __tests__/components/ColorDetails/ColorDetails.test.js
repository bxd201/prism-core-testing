import React from 'react'
import { shallow } from 'enzyme'
import { ColorDetails } from 'src/components/Facets/ColorDetails/ColorDetails'
import * as Colors from '__mocks__/data/color/Colors'

// init props of Compoennt
const color = Colors.getColor()
const match = { params: { colorId: 'id', router: jest.fn() } }
const config = { ga_domain_id: 'sherwinWilliamsDefault' }

const wrapper = shallow(<ColorDetails match={match} colors={color} config={config} />)

// Snapshot testing
describe('Color Details Container Component should rendering correctly', () => {
  it('it should match snapshot and rendering corretly', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
// Rendering testing
describe('Testing props pass ccorrectly for color details component', () => {
  it('ColorChipMaximizer component should rendering when get correct props', () => {
    expect(wrapper.find('div.color-detail-view:first-child').exists()).toBe(true)
  })

  it('ColorViewer component should rendering when get correct props', () => {
    expect(wrapper.find('ColorViewer').exists()).toBe(true)
  })

  it('SceneManager component should rendering when get correct props', () => {
    expect(wrapper.find('div.color-detail__scene-wrapper').exists()).toBe(true)
  })

  it('ColorStrip component should rendering when get correct props', () => {
    expect(wrapper.find('div.color-info__main-info').exists()).toBe(true)
  })

  it('Coordinating Colors component should rendering when get correct props', () => {
    expect(wrapper.find('CoordinatingColors').exists()).toBe(true)
  })

  it('SimilarColors component should rendering when get correct props', () => {
    expect(wrapper.find('SimilarColors').exists()).toBe(true)
  })

  it('Color Info component should rendering when get correct props', () => {
    expect(wrapper.find('ColorInfo').exists()).toBe(true)
  })
})

describe('Testing state for color details component', () => {
  it('State should initialize correctly', () => {
    const detailsState = wrapper.instance().state
    expect(detailsState).toEqual({
      sceneIsDisplayed: true,
      chipIsMaximized: false,
      a11yMessage: '',
      a11yAssertMessage: ''
    })
  })
})

// Behavior testing
describe('Event tesing for behavoir of color details component', () => {
  it('Testing for toggle Scene Display ', () => {
    const toggleSceneDisplayMock = jest.fn()
    wrapper.instance().toggleSceneDisplay = toggleSceneDisplayMock
    wrapper.instance().forceUpdate()
    wrapper.find('div.color-detail__info-wrapper > button:first-child').simulate('click')
    expect(toggleSceneDisplayMock).toHaveBeenCalled()
  })

  it('Testing for report tabSwitch to GA', () => {
    const reportTabSwitchToGAMock = jest.fn()
    wrapper.instance().reportTabSwitchToGA = reportTabSwitchToGAMock
    wrapper.instance().forceUpdate()
    wrapper.find('Tabs').simulate('select')
    expect(reportTabSwitchToGAMock).toHaveBeenCalled()
  })
})
