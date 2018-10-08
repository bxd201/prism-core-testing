import { colors } from '../../src/reducers/colors'
import { scenes } from '../../src/reducers/scenes'

test('colors reducer changes status', () => {
  const state = colors({ status: 'pending' }, { type: 'REQUEST_COLORS', payload: 'done' })
  expect(state).toEqual({ status: 'done' })
})

test('colors reducer updates items', () => {
  const state = colors({ items: [] }, { type: 'RECEIVE_COLORS', payload: { colors: [{ test: true }] } })
  expect(state).toEqual({ items: [{ test: true }] })
})

test('colors reducer default', () => {
  const state = colors({ items: [] }, { type: 'TEST', payload: { colors: [{ test: true }] } })
  expect(state).toEqual({ items: [] })
})

test('colors reducer undefined state', () => {
  const state = colors(undefined, { type: 'TEST' })
  expect(state).toEqual({})
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
  expect(state).toEqual({})
})
