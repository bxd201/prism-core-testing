import React from 'react'
import { render, screen } from '@testing-library/react'
import { Color } from '../../interfaces/colors'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import Search from './search'

const mockSetQuery = jest.fn()

const testResults: Color[] = colors.slice(0, 10)

const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

describe('Search component', () => {
  beforeAll(() => {
    // makes react-virtualized initialize properly and show children
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 50 })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 50 })
  })

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
  })

  test('It mounts', () => {
    render(<Search results={[]} isLoading={false} query='' setQuery={mockSetQuery} />)
  })

  test('Renders with results', async () => {
    render(<Search results={testResults} isLoading={false} query='' setQuery={mockSetQuery} />)

    const swatches = screen.queryAllByTestId('wall-color-swatch-undefined')
    expect(swatches).toHaveLength(10)
  })

  test('Handles loading prop', async () => {
    render(<Search results={testResults} isLoading query='' setQuery={mockSetQuery} />)

    const swatches = screen.queryAllByTestId('wall-color-swatch-undefined')
    expect(swatches).toHaveLength(0)
    expect(screen.getByText('Searching')).toBeInTheDocument()
  })

  test('Shows prompt', async () => {
    render(<Search results={[]} isLoading={false} query='' setQuery={mockSetQuery} />)

    expect(screen.getByText('Enter a color name, number, or family in the text field above.')).toBeInTheDocument()
  })

  test('Shows no results message', async () => {
    const { rerender } = render(<Search results={[]} isLoading={false} query='asdf' setQuery={mockSetQuery} />)

    rerender(<Search results={testResults} isLoading={false} query='asdf' setQuery={mockSetQuery} />)
    rerender(<Search results={[]} isLoading={false} query='asdf' setQuery={mockSetQuery} />)

    expect(await screen.findByText('Sorry, no color matches found.')).toBeInTheDocument()
  })
})
