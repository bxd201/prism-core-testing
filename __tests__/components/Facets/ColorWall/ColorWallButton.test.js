import React from 'react'
import renderer from 'react-test-renderer'

import ColorWallButton from 'src/components/Facets/ColorWall/ColorWallButton'

describe('<ColorWallButton />', () => {
  test('testing true', () => {
    const state = {
      family: 'All'
    }

    let clickFn = jest.fn()

    const component = renderer.create(
      <ColorWallButton family={state.family} selectFamily={clickFn} />
    ).toJSON()

    expect(component).toMatchSnapshot()

    component[0].props.onChange()

    expect(clickFn).toHaveBeenCalledWith(state.family)
  })
})
