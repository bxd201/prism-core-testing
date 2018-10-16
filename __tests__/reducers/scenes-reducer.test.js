import * as actions from '../../src/actions/scenes'
import { scenes } from '../../src/reducers/scenes'

const initialState = {
  scene: '',
  selectedColor: {}
}

describe('scenes-reducer', () => {
  test('changes selectedColor', () => {
    const state = scenes(initialState, {
      type: actions.COLOR_SELECTED,
      payload: { color: 'purple' }
    })

    expect(state).toEqual({
      ...initialState,
      selectedColor: 'purple'
    })
  })

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
