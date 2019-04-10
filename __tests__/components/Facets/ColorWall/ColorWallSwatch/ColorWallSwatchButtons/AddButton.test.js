/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import AddButton from 'src/components/Facets/ColorWall/ColorWallSwatch/ColorWallSwatchButtons/AddButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const onAddMock = jest.fn()
const onClickMock = jest.fn()

const getAddButton = (props) => {
  let defaultProps = {
    config: {
      ColorWall: {
        displayAddButton: true
      }
    },
    onAdd: onAddMock,
    onClick: onClickMock
  }

  let newProps = Object.assign({}, defaultProps, props)
  return shallow(<AddButton {...newProps} />)
}

describe('AddButton with onAdd undefined', () => {
  let addButton
  beforeAll(() => {
    if (!addButton) {
      addButton = getAddButton({ onAdd: undefined })
    }
  })

  it('should match snapshot', () => {
    expect(addButton).toMatchSnapshot()
  })

  it('should render null', () => {
    expect(addButton).toEqual({})
  })
})

describe('AddButton', () => {
  let addButton
  beforeAll(() => {
    if (!addButton) {
      addButton = getAddButton()
    }
  })

  it('should match snapshot', () => {
    expect(addButton).toMatchSnapshot()
  })

  it('should render button', () => {
    console.log('addButton ', addButton.debug())
    expect(addButton.find('button').exists()).toBeTruthy()
  })

  it('should render button with FontAwesomeIcon component', () => {
    expect(addButton.find(FontAwesomeIcon).exists()).toBeTruthy()
  })

  it('should call onClickMock when button is clicked', () => {
    addButton.find('button').simulate('click')
    expect(onClickMock).toHaveBeenCalled()
  })
})

describe('AddButton event', () => {
  let addButton
  beforeAll(() => {
    if (!addButton) {
      addButton = getAddButton()
    }
  })

  it('should call onClickMock when button is clicked', () => {
    addButton.find('button').simulate('click')
    expect(onClickMock).toHaveBeenCalled()
  })
})
