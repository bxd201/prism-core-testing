import React from 'react'
import { act, render, screen } from '@testing-library/react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Toggle, { TEST_ID, TEST_ID_CHECK, TEST_ID_CHECK_LABEL, TEST_ID_ICON_0, TEST_ID_ICON_1 } from './toggle'
import { faSun, faMoon } from '@fortawesome/pro-solid-svg-icons'
import { CustomIcon } from '../../types'
import userEvent from '@testing-library/user-event'

const itemList = [
  { icon: faSun, label: 'day' },
  { icon: faMoon, label: 'night' }
] as [CustomIcon, CustomIcon]

const itemList2 = [{ icon: null }, { icon: null }] as [CustomIcon, CustomIcon]

const toggleHandler = jest.fn((isOn: number) => undefined)

describe('Toggle', () => {
  test('Toggle shows the label of the first item provided', () => {
    render(<Toggle handleToggle={toggleHandler} itemList={itemList} />)
    const icon0 = screen.getByTestId(TEST_ID_ICON_0)
    expect(icon0).toHaveTextContent(itemList[0].label)
  })

  test('Toggle shows the icon of the first item provided', () => {
    render(<Toggle handleToggle={toggleHandler} itemList={itemList2} />)
    const icon0 = screen.getByTestId(TEST_ID_ICON_0)
    expect(icon0).toBeEmptyDOMElement()
  })

  test('Toggle shows the label of the second item provided', () => {
    render(<Toggle handleToggle={toggleHandler} itemList={itemList} />)
    const icon1 = screen.getByTestId(TEST_ID_ICON_1)
    expect(icon1).toHaveTextContent(itemList[1].label)
  })

  test('Toggle should not be checked if isOnInitial is unspecified', async () => {
    render(<Toggle handleToggle={toggleHandler} itemList={itemList} />)
    expect(screen.getByTestId(TEST_ID_CHECK)).not.toBeChecked()
  })

  test('Toggle callback should be passed a value of 1 when isOnInitial is unspecified and a user clicks the label', async () => {
    const user = userEvent.setup()
    const mockHandler = jest.fn((isOn) => undefined)
    render(<Toggle handleToggle={mockHandler} itemList={itemList} />)
    const label = screen.getByTestId(TEST_ID_CHECK_LABEL)
    void (await act(async () => {
      await user.click(label)
    }))
    const mockVal = mockHandler.mock.calls[0][0]
    expect(mockVal).toEqual(1)
  })

  test('Toggle should be checked if isOnInitial is unspecified and a user clicks the label', async () => {
    const user = userEvent.setup()
    render(<Toggle handleToggle={toggleHandler} itemList={itemList} />)
    const label = screen.getByTestId(TEST_ID_CHECK_LABEL)
    void (await act(async () => {
      await user.click(label)
    }))
    expect(screen.getByTestId(TEST_ID_CHECK)).toBeChecked()
  })

  test('Toggle should be unchecked if isOnInitial is specified and a user clicks the label', async () => {
    const user = userEvent.setup()
    render(<Toggle handleToggle={toggleHandler} itemList={itemList} isOnInitial={true} />)
    const label = screen.getByTestId(TEST_ID_CHECK_LABEL)
    void (await act(async () => {
      await user.click(label)
    }))
    expect(screen.getByTestId(TEST_ID_CHECK)).not.toBeChecked()
  })

  test('The wrapper should be style to the value of textColor if a currentColor is also specified', async () => {
    const color = '#ff6600'
    const bgColor = '#000000'
    render(<Toggle handleToggle={toggleHandler} itemList={itemList} textColor={color} currentColor={bgColor} />)
    const wrapper = screen.getByTestId(TEST_ID)
    expect(wrapper).toHaveStyle(`color:${color}`)
  })
})
