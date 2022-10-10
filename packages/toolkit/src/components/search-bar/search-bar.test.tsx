import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './search-bar'

const handleSetValue = jest.fn()
const onClickBack = jest.fn()
const onClickCancel = jest.fn()

const testValue = 'a default value'

describe('SearchBar component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Renders', () => {
    render(<SearchBar value='' setValue={handleSetValue} />)
  })

  test('Renders with set value', () => {
    render(<SearchBar value={testValue} setValue={handleSetValue} />)

    expect(screen.getByDisplayValue(testValue)).toBeInTheDocument()
  })

  test('Clears value when clear button clicked', async () => {
    render(<SearchBar value={testValue} setValue={handleSetValue} />)

    const clearButton = screen.getByLabelText('clear')
    expect(screen.getByDisplayValue(testValue)).toBeInTheDocument()
    await userEvent.click(clearButton)
    expect(screen.queryByDisplayValue(testValue)).not.toBeInTheDocument()
    expect(handleSetValue).toBeCalledTimes(2)
  })

  test('Calls set value when value changes', async () => {
    render(<SearchBar value={testValue} setValue={handleSetValue} />)
    const inputTest = 'test'
    const searchInput = screen.getByDisplayValue(testValue)

    await userEvent.type(searchInput, inputTest)
    expect(handleSetValue).toBeCalledWith(`${testValue}${inputTest}`)
  })

  test('Fires back and cancel callbacks', async () => {
    render(
      <SearchBar
        value={testValue}
        setValue={handleSetValue}
        onClickBack={onClickBack}
        onClickCancel={onClickCancel}
        showBackButton
        showCancelButton
      />
    )

    const backButton = screen.getByLabelText('back')
    await userEvent.click(backButton)
    expect(onClickBack).toBeCalled()

    const cancelButton = screen.getByText('CANCEL')
    await userEvent.click(cancelButton)
    expect(onClickCancel).toBeCalled()
  })
})
