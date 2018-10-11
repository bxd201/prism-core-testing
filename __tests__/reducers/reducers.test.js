import { colors } from '../../src/reducers/colors'
import { scenes } from '../../src/reducers/scenes'

const colorState = {
  status: {
    loading: true
  },
  items: {},
  family: 'All'
}

const sceneState = {
  selectedColor: {}
}


test('colors reducer changes status', () => {
  const state = colors(colorState, { type: 'REQUEST_COLORS', payload: { loading: false } })
  const result = { ...colorState, status: { loading: false } }

  expect(state).toEqual(result)
})

test('colors reducer updates items', () => {
  const state = colors(colorState, { type: 'RECEIVE_COLORS', payload: { colors: [{ test: true }], loading: false } })
  const result = { ...colorState, items: [{ test: true }], status: { loading: false } }

  expect(state).toEqual(result)
})

test('colors reducer default', () => {
  const state = colors(colorState, { type: 'TEST', payload: { colors: [{ test: true }] } })
  expect(state).toEqual(colorState)
})

test('colors reducer undefined state', () => {
  const state = colors(undefined, { type: 'TEST' })
  expect(state).toEqual(colorState)
})

test('scenes reducer changes selectedColor', () => {
  const state = scenes({ selectedColor: 'blue' }, { type: 'COLOR_SELECTED', payload: { color: 'purple' } })
  expect(state).toEqual({ selectedColor: 'purple' })
})

test('scenes reducer changes scene', () => {
  const state = scenes({ scene: 'test' }, { type: 'SELECT_SCENE', payload: { scene: 'testing' } })
  expect(state).toEqual({ scene: 'testing' })
})

test('scenes reducer default', () => {
  const state = scenes({ scene: 'test' }, { type: 'TEST', payload: { scene: 'testing' } })
  expect(state).toEqual({ scene: 'test' })
})

test('scenes reducer undefined state', () => {
  const state = scenes(undefined, { type: 'TEST' })
  expect(state).toEqual(sceneState)
})
