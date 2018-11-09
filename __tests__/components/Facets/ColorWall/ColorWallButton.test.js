import React from 'react'
import renderer from 'react-test-renderer'
import configureStore from 'redux-mock-store'

import ColorWallButton from 'src/components/Facets/ColorWall/ColorWallButton'

const mockStore = configureStore();
const store = mockStore({});

describe('<ColorWallButton />', () => {
  test('testing true', () => {
    const state = {
      family: 'All'
    }

    let clickFn = jest.fn()

    const component = renderer.create(
      <ColorWallButton store={store} family={state.family} selectFamily={clickFn} />
    ).toJSON()

    expect(component).toMatchSnapshot()

    component[0].props.onClick()

    expect(clickFn).toHaveBeenCalledWith(state.family)
  })
})
