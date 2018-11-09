import React from 'react'
import renderer from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import ColorSwatch from 'src/components/ColorSwatch/ColorSwatch'

const mockStore = configureStore();
const store = mockStore({});

describe('<ColorSwatch />', () => {
  test('Color is selected when clicked', () => {
    const color = {
      hex: '#000',
      name: 'Tricorn Black'
    }
    const component = renderer.create(
      <ColorSwatch store={store} color={color} />
    ).toJSON()

    component.props.onClick()

    const actions = store.getActions()

    expect(actions[0].payload.color).toEqual(color)
  })
})
