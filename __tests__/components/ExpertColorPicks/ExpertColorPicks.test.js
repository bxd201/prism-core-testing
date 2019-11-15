import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import { ExpertColorPicks } from 'src/components/ExpertColorPicks/ExpertColorPicks'
import ExpertColorDetails from 'src/components/ExpertColorPicks/ExpertColorDetails'
import { ColorListWithCarousel } from 'src/components/Carousel/Carousel'

const collectionDataDetails = {
  colorDefs: [
    { hex: '#bc9c9e' },
    { hex: '#bc9c9e' },
    { hex: '#bc9c9e' }
  ]
}

const getExpertColorPicks = props => {
  return mount(
      <Provider store={{
        getState: () => ({
          expertColorPicks: { data: [collectionDataDetails] },
          lp: { colors: [] }
        }),
        subscribe: () => {},
        dispatch: () => {}
      }}>
        <ExpertColorPicks {...props} />
      </Provider>)
}

const setHeader = jest.fn(), showBack = jest.fn(), setState = jest.fn()

const useStateSpy = jest.spyOn(React, 'useState')

describe('isShowBack = false', () => {
  let expertColorPicks
  useStateSpy.mockImplementation((init) => [init, setState]);

  beforeEach(() => expertColorPicks = getExpertColorPicks({ isShowBack: false, setHeader: setHeader, showBack: showBack }))

  afterEach(jest.clearAllMocks)

  it('renders a carousel', () => {
    expect(expertColorPicks.find(ColorListWithCarousel).exists()).toBe(true)
    expect(expertColorPicks.find(ExpertColorDetails).exists()).toBe(false)
  })

  it('calls setHeader', () => expect(setHeader.mock.calls[0][0]).toBe('Expert Color Picks'))

  it('Clicking the first collection calls showBack & setState', () => {
    expertColorPicks.find('.collection__summary__wrapper').simulate('click')
    expect(showBack.mock.calls.length).toBe(1)
    expect(setState.mock.calls.length).toBe(1)
  })
})

describe('isShowBack = true', () => {
  let expertColorPicks
  useStateSpy.mockImplementation((init) => [collectionDataDetails, setState]);

  beforeEach(() => expertColorPicks = getExpertColorPicks({ isShowBack: true, setHeader: setHeader, showBack: showBack }))

  afterEach(jest.clearAllMocks)

  it('renders Color details', () => {
    expect(expertColorPicks.find(ColorListWithCarousel).exists()).toBe(false)
    expect(expertColorPicks.find(ExpertColorDetails).exists()).toBe(true)
  })
  
})
