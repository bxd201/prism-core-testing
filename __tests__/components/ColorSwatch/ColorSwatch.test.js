import React from 'react'
import renderer from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import ColorSwatch from 'src/components/ColorSwatch/ColorSwatch'
import * as Colors from '__mocks__/data/color/Colors'

const mockStore = configureStore();
const store = mockStore({});

describe('<ColorSwatch />', () => {
  test('Color is selected when clicked', () => {
    const color = Colors.getColor()
    const component = renderer.create(
      <ColorSwatch store={store} color={color} />
    ).toJSON()

    component.props.onClick()

    const actions = store.getActions()

    expect(actions[0].payload.color).toEqual(color)
  })
})
