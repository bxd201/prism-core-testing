import React from 'react'
import { shallow } from 'enzyme'
import { ColorPickerSlide } from 'src/components/ColorPickerSlide/ColorPickerSlide'
import PaletteSuggester from 'src/components/ColorPickerSlide/ColorPickerSlideContainer'
import MoreDetailsCollapse from 'src/components/ColorPickerSlide/MoreDetails'

const createColorPickerSlide = (props = {}) => {
  return shallow(<ColorPickerSlide {...{
    colorMap: {
      '2761' : { colorNumber: '7080' },
      '2043' : { colorNumber: '6357' },
      '2689' : { colorNumber: '7008' }
    },
    expertColorPicks: [2761, 2043, 2689]
  }} {...props} />)
}

it('has colors specified by expertColorPicks property', () => {
  const colorPickerSlide = createColorPickerSlide()
  expect(colorPickerSlide.find(PaletteSuggester).props().expertColor).toEqual([
    { colorNumber: '7080' }, { colorNumber: '6357' }, { colorNumber: '7008' }
  ])
})

it('renders details when there is an associatedColorCollection', () => {
  const colorPickerSlide = createColorPickerSlide({ associatedColorCollection: 1234 })
  expect(colorPickerSlide.find(MoreDetailsCollapse).exists()).toBe(true)
})

it('does\'t render details when there isn\'t an associatedColorCollection', () => {
  const colorPickerSlide = createColorPickerSlide({})
  expect(colorPickerSlide.find(MoreDetailsCollapse).exists()).toBe(false)
})
