import * as actions from '../../src/actions/loadColors'
import { colors } from '../../src/reducers/colors'

const initialState = {
  status: {
    loading: true
  },
  items: {},
  family: 'All'
}

describe('colors-reducer', () => {
  test('changes status', () => {
    const state = colors(initialState, {
      type: actions.REQUEST_COLORS,
      payload: { loading: false }
    })

    expect(state).toEqual({
      ...initialState,
      status: { loading: false }
    })
  })

  test('updates items', () => {
    const state = colors(initialState, {
      type: actions.RECEIVE_COLORS,
      payload: { colors: [{ test: true }], loading: false }
    })

    expect(state).toEqual({
      ...initialState,
      items: [{ test: true }], status: { loading: false }
    })
  })

  test('filters by family', () => {
    const state = colors(initialState, {
      type: actions.FILTER_BY_FAMILY,
      payload: { family: 'Green' }
    })

    expect(state).toEqual({
      ...initialState,
      family: 'Green'
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
