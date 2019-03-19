import * as actions from 'src/store/actions/live-palette'
import { lp, initialState } from 'src/store/reducers/live-palette-reducer'
import * as Colors from '__mocks__/data/color/Colors'

const color = Colors.getColor()

describe('live-palette-reduer', () => {
  it('should return the initial state', () => {
    expect(lp(undefined, initialState)).toEqual(initialState)
  })

  it('should handle ADD_LP_COLOR', () => {
    const mock = {
      type: actions.ADD_LP_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp({ colors: [] }, mock)).toEqual({ ...initialState, colors: [color], activeColor: color })
  })

  it('should handle REMOVE_LP_COLOR', () => {
    const mock = {
      type: actions.REMOVE_LP_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp([], mock)).toEqual({ ...initialState, colors: [], activeColor: null })
  })

  it('should handle ACTIVATE_LP_COLOR', () => {
    const mock = {
      type: actions.ACTIVATE_LP_COLOR,
      payload: {
        color: color
      }
    }

    expect(lp([], mock)).toEqual({ ...initialState, activeColor: color })
  })
})