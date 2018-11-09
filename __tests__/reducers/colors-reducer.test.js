import * as colorActions from 'src/actions/loadColors'
import * as searchActions from 'src/actions/loadSearchResults'
import { colors, initialState } from 'src/reducers/colors'

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

  test('updates items', () => {
    const state = colors(initialState, {
      type: colorActions.RECEIVE_COLORS,
      payload: { colors: [{ test: true }], loading: false }
    })

    expect(state).toEqual({
      ...initialState,
      items: [{ test: true }], status: { loading: false }
    })
  })

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
      payload: { loading: false, results: [{ test: true }] }
    })

    expect(state).toEqual({
      ...initialState,
      status: { loading: false },
      searchResults: [{ test: true }]
    })
  })

  test('default', () => {
    const state = colors(initialState, {
      type: 'TEST',
      payload: { colors: [{ test: true }] }
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
