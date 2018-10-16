import React from 'react'
import renderer from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import ColorWallButton from '../../../../src/components/Facets/ColorWall/ColorWallButton'

const mockStore = configureStore();
const store = mockStore({});

describe('<ColorWallButton />', () => {
  test('testing true', () => {
    const state = {
      family: 'All'
    }

    const component = renderer.create(
      <ColorWallButton store={store} family={state.family} />
    ).toJSON()

    component[0].props.onClick()

    const actions = store.getActions()

    expect(actions[0].payload.family).toEqual(state.family)
  })
})
