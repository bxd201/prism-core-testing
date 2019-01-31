import * as actions from 'src/store/actions/scenes'
import { scenes, initialState } from 'src/store/reducers/scenes'

import * as Scenes from '__mocks__/data/scene/Scenes'

describe('scenes-reducer', () => {
  test('handles default case', () => {
    const state = scenes(initialState, {
      type: 'TEST',
      payload: { scene: Scenes.getScene() }
    })

    expect(state).toEqual(initialState)
  })

  test('handles undefined state', () => {
    const state = scenes(undefined, { type: 'TEST' })

    expect(state).toEqual(initialState)
  })
})
