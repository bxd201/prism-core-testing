import * as colorActions from 'src/actions/loadColors'
import * as searchActions from 'src/actions/loadSearchResults'
import { colors, initialState } from 'src/reducers/colors'

import * as Colors from '__mocks__/data/color/Colors'

const color = Colors.getColor()

describe('colors-reducer', () => {
  test('changes status for colors request', () => {
    const state = colors(initialState, {
      type: colorActions.REQUEST_COLORS,
      payload: { loading: false }
    })

    expect(state).toEqual({
      ...initialState,
      status: { loading: false }
    })
  })

  // TODO: Fix this so it accounts for brights, families, etc.
  // test('updates items', () => {
  //   const state = colors(initialState, {
  //     type: colorActions.RECEIVE_COLORS,
  //     payload: { colors: [color], loading: false }
  //   })

  //   expect(state).toEqual({
  //     ...initialState,
  //     items: [color], status: { loading: false }
  //   })
  // })

  test('filters by family', () => {
    const state = colors(initialState, {
      type: colorActions.FILTER_BY_FAMILY,
      payload: { family: 'Green' }
    })

    expect(state).toEqual({
      ...initialState,
      family: 'Green'
    })
  })

  test('changes status for search request', () => {
    const state = colors(initialState, {
      type: searchActions.REQUEST_SEARCH_RESULTS,
      payload: { status: { loading: true } }
    })

    expect(state).toEqual({
      ...initialState,
      status: { loading: true }
    })
  })

  test('updates results for search received', () => {
    const state = colors(initialState, {
      type: searchActions.RECEIVE_SEARCH_RESULTS,
      payload: { loading: false, results: [color] }
    })

    expect(state).toEqual({
      ...initialState,
      status: { loading: false },
      searchResults: [color]
    })
  })

  test('default', () => {
    const state = colors(initialState, {
      type: 'TEST',
      payload: { colors: [color] }
    })

    expect(state).toEqual(initialState)
  })

  test('handles undefined state', () => {
    const state = colors(undefined, {
      type: 'TEST'
    })

    expect(state).toEqual(initialState)
  })
})
