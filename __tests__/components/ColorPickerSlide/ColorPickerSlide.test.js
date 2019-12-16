import React from 'react'
import { shallow } from 'enzyme'
import { ColorPickerSlide } from 'src/components/ColorPickerSlide/ColorPickerSlide'
import PaletteSuggester from 'src/components/ColorPickerSlide/ColorPickerSlideContainer'
import MoreDetailsCollapse from 'src/components/ColorPickerSlide/MoreDetails'


const defaultProps = {
  expertColorPicks: [2761, 2043, 2689]
}

const mockedStoreValues = {
  colors: {
    items: {
      colorMap: {
        '2761' : { colorNumber: '7080' },
        '2043' : { colorNumber: '6357' },
        '2689' : { colorNumber: '7008' }
      }
    }
  },
  collectionSummaries: {
    summaries: {
      data: [{
        id: 1234
      }],
      idToIndexHash: [0]
    }
  }
}


describe('<ColorPickerSlide />', () => {

  test('matches snapshot', () => {
    expect(mocked(<ColorPickerSlide {...defaultProps} />)).toMatchSnapshot()
  })

  test('has colors specified by expertColorPicks property', () => {
    const mockedColorPickerSlide = mocked(<ColorPickerSlide {...defaultProps} />, { mockedStoreValues: mockedStoreValues })
    expect(mockedColorPickerSlide.find(PaletteSuggester).props().expertColor).toEqual([
      { colorNumber: '7080' }, { colorNumber: '6357' }, { colorNumber: '7008' }
    ])
  })

  it('renders details when there is an associatedColorCollection', () => {
    const colorPickerSlide = mocked(<ColorPickerSlide {...defaultProps} associatedColorCollection={0} />, { mockedStoreValues: mockedStoreValues })
    expect(colorPickerSlide.find(MoreDetailsCollapse).exists()).toBe(true)
  })

  it('does\'t render details when there isn\'t an associatedColorCollection', () => {
    const colorPickerSlide = mocked(<ColorPickerSlide {...defaultProps} />, { mockedStoreValues: mockedStoreValues })
    expect(colorPickerSlide.find(MoreDetailsCollapse).exists()).toBe(false)
  })
})
