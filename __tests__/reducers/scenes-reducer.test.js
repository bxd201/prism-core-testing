import * as actions from '../../src/actions/scenes'
import { scenes, initialState } from '../../src/reducers/scenes'

describe('scenes-reducer', () => {
  test('changes scene', () => {
    const state = scenes(initialState, {
      type: actions.SELECT_SCENE,
      payload: { scene: 'testing' }
    })

    expect(state).toEqual({
      ...initialState,
      scene: 'testing'
    })
  })

  test('handles default case', () => {
    const state = scenes(initialState, {
      type: 'TEST',
      payload: { scene: 'testing' }
    })

    expect(state).toEqual(initialState)
  })

  test('handles undefined state', () => {
    const state = scenes(undefined, { type: 'TEST' })

    expect(state).toEqual(initialState)
  })
})
