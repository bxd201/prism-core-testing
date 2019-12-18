/* eslint-env jest */
import React from 'react'
import AddButton from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/AddButton'
import ColorWallContext from 'src/components/Facets/ColorWall/ColorWallContext'

const onClickMock = jest.fn()

describe('default AddButton', () => {
  test('should not render', () => expect(mocked(<AddButton />).find(AddButton)).toEqual({}))
})

describe('AddButton wrapped in ColorWallContext with displayAddButton = true', () => {
  let addButton
  beforeAll(() => {
    addButton = mocked(
      <ColorWallContext.Provider value={{ displayAddButton: true }}>
        <AddButton onClick={onClickMock} />
      </ColorWallContext.Provider>
    )
  })

  test('should match snapshot', () => expect(addButton).toMatchSnapshot())

  test('should call onClickMock when button is clicked', () => {
    addButton.simulate('click')
    expect(onClickMock).toHaveBeenCalled()
  })
})
