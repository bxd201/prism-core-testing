import React from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import ExpertColorDetails from 'src/components/ExpertColorPicks/ExpertColorDetails'

const livePaletteColors = [{ hex: '#c4c4c4', brandKey: 'SW', colorNumber: 90212, name: 'Blue' }]
const dispatch = jest.fn(({ payload: { color } }) => livePaletteColors.push(color))

const getExpertColorDetails = () => {
  return mount(
    <Provider store={{
      getState: () => ({ lp: { colors: livePaletteColors } }),
      subscribe: jest.fn(),
      dispatch: dispatch
    }}>
      <ExpertColorDetails expertColors={{
        colorDefs: [
          { hex: '#cdd2d2', brandKey: 'SW', colorNumber: 90210, name: 'Bobafett' },
          { hex: '#a2a2a2', brandKey: 'SW', colorNumber: 90211, name: 'Green' },
          { hex: '#c4c4c4', brandKey: 'SW', colorNumber: 90212, name: 'Blue' }
        ]
      }} />
    </Provider>)
}

let expertColorDetails

beforeEach(() => expertColorDetails = getExpertColorDetails())

it('renders a color wall for each color', () => {
  const colorWalls = expertColorDetails.find('.prism-expert-color-details__content__wrapper')
  expect(colorWalls).toHaveLength(3)
  expect(colorWalls.get(0).props.style.backgroundColor).toBe('#cdd2d2')
  expect(colorWalls.get(1).props.style.backgroundColor).toBe('#a2a2a2')
  expect(colorWalls.get(2).props.style.backgroundColor).toBe('#c4c4c4')
})

it('shows a faCheckCircle for colors that are already present in the live-palette', () => {
  expect(expertColorDetails.find('svg[data-icon="check-circle"]')).toHaveLength(1)
  expect(expertColorDetails.find('svg[data-icon="plus-circle"]')).toHaveLength(2)
})

it('clicking a button calls add dispatch function and updates icons', () => {
  expertColorDetails.find('button').first().simulate('click')
  expect(dispatch.mock.calls[0][0]).toEqual({
    payload: {
      color: { brandKey: 'SW', colorNumber: 90210, hex: '#cdd2d2', name: 'Bobafett' }
    },
    type: 'ADD_LP_COLOR'
  })
})
