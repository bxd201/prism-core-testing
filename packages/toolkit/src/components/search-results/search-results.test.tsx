import React from 'react'
import { render, screen } from '@testing-library/react'
import { Color } from '../../interfaces/colors'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import { SwatchRenderer } from '../../types'
import SearchResults from './search-results'

const testResults: Color[] = colors.slice(0, 10)

const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

const testChildren = <p>test children</p>
const testSwatchId = 'test-swatch-renderer'
const testSwatchRenderer: SwatchRenderer = ({ color, style }) => {
  return (
    <div style={style} data-testid={testSwatchId}>
      <p>{color.colorNumber}</p>
    </div>
  )
}

describe('SearchResults component', () => {
  beforeAll(() => {
    // makes react-virtualized initialize properly and show children
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 50 })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 50 })
  })

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
  })

  test('Renders', () => {
    render(<SearchResults />)
  })

  test('Renders with results', async () => {
    render(<SearchResults results={testResults}>{testChildren}</SearchResults>)

    const swatches = screen.queryAllByTestId('wall-color-swatch-undefined')
    expect(swatches).toHaveLength(10)
    expect(screen.queryByText('test children')).not.toBeInTheDocument()
  })

  test('Renders with custom swatch renderer', async () => {
    render(
      <SearchResults results={testResults} swatchRenderer={testSwatchRenderer}>
        {testChildren}
      </SearchResults>
    )

    const swatches = screen.queryAllByTestId(testSwatchId)
    expect(swatches).toHaveLength(10)
    expect(screen.queryByText('test children')).not.toBeInTheDocument()
  })
})
