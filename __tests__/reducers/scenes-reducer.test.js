import { scenes, initialState } from 'src/store/reducers/scenes'

describe('scenes-reducer', () => {
  test('handles undefined state', () => {
    const state = scenes(undefined, { type: 'TEST' })

    expect(state).toEqual(initialState)
  })
})
