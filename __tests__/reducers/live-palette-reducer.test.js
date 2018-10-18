import * as actions from '../../src/actions/live-palette'
import { lp, initialState } from '../../src/reducers/live-palette-reducer'

describe('live-palette-reduer', () => {
  it('should return the initial state', () => {
    expect(lp(undefined, initialState)).toEqual(initialState)
  })

  it('should handle ADD_LP_COLOR', () => {
    const mock = {
      type: actions.ADD_LP_COLOR,
      payload: {
        color: { id: 1 }
      }
    }

    expect(lp({ colors: [] }, mock)).toEqual({ ...initialState, colors: [{ id: 1 }], activeColor: { id: 1 } })
  })

  it('should handle REMOVE_LP_COLOR', () => {
    const mock = {
      type: actions.REMOVE_LP_COLOR,
      payload: {
        color: { id: 1 }
      }
    }

    expect(lp([], mock)).toEqual({ ...initialState, colors: [], activeColor: null })
  })

  it('should handle ACTIVATE_LP_COLOR', () => {
    const mock = {
      type: actions.ACTIVATE_LP_COLOR,
      payload: {
        color: { id: 1 }
      }
    }

    expect(lp([], mock)).toEqual({ ...initialState, activeColor: { id: 1 } })
  })
})