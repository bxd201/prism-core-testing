import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Color } from '../../types'
import ColorSwatch from './color-swatch'

const ID = 11331
const TEST_ID_INNER_SWATCH = `inner-swatch-${ID}`
const TEST_ID_MARKER = `wall-color-swatch-flag-${ID}`

describe('Color Swatch Component', () => {
  // @ts-ignore
  const colorObj: Color = {
    brandKey: 'SW',
    colorNumber: '9151',
    coordinatingColors: {
      coord1ColorId: '11346',
      coord2ColorId: '11357',
      whiteColorId: '1925'
    },
    hex: '#899caa',
    id: '11331',
    isDark: false,
    name: 'Daphne'
  }

  test('The active attribute toggles the contents of the swatch', async () => {
    const { rerender } = render(<ColorSwatch active color={colorObj} id={ID} />)
    expect(screen.getByText('Daphne')).toBeInTheDocument()

    rerender(<ColorSwatch active={false} color={colorObj} />)
    expect(screen.queryByText('Daphne')).toBeNull()
  })

  test('aria-label is used when passed, and defaults to color name when absent', async () => {
    const testLabel = 'test label'
    const { rerender } = render(<ColorSwatch active={false} color={colorObj} id={ID} aria-label={testLabel} />)
    expect(screen.getByLabelText(testLabel)).toBeInTheDocument()

    rerender(<ColorSwatch active={false} color={colorObj} id={ID} />)
    expect(screen.getByLabelText(colorObj.name)).toBeInTheDocument()
  })

  test('Renderer content is displayed when passed into the component', () => {
    render(<ColorSwatch active color={colorObj} id={ID} renderer={() => <div>Test Text</div>} />)
    expect(screen.getByText('Test Text')).toBeInTheDocument()
  })

  test('Inactive swatch click callback is called when clicking on the swatch', () => {
    const onSwatchButtonClick = jest.fn()
    render(<ColorSwatch active={false} color={colorObj} onClick={onSwatchButtonClick} id={ID} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(onSwatchButtonClick).toHaveBeenCalled()
  })

  test('Swatch text is light or dark depending on if color is dark or light', () => {
    const { rerender } = render(
      <ColorSwatch active={true} color={{ ...colorObj, isDark: false }} activeFocus={false} id={ID} />
    )
    expect(screen.getByTestId(TEST_ID_INNER_SWATCH)).toHaveClass('text-black')
    rerender(<ColorSwatch active={true} color={{ ...colorObj, isDark: true }} activeFocus={false} id={ID} />)
    expect(screen.getByTestId(TEST_ID_INNER_SWATCH)).toHaveClass('text-white')
  })

  describe('Setting flagged', () => {
    describe('to true', () => {
      test('on an inactive swatch renders a marker', () => {
        render(<ColorSwatch active={false} flagged color={colorObj} id={ID} />)
        expect(screen.queryByTestId(TEST_ID_MARKER)).toBeInTheDocument()
      })
      test('on an active swatch renders a marker', () => {
        render(<ColorSwatch active={true} flagged color={colorObj} id={ID} />)
        expect(screen.queryByTestId(TEST_ID_MARKER)).toBeInTheDocument()
      })
    })
    describe('to false', () => {
      test('on an inactive swatch DOES NOT render a marker', () => {
        render(<ColorSwatch active={false} flagged={false} color={colorObj} id={ID} />)
        expect(screen.queryByTestId(TEST_ID_MARKER)).not.toBeInTheDocument()
      })
      test('on an active swatch DOES NOT render a marker', () => {
        render(<ColorSwatch active={true} flagged={false} color={colorObj} id={ID} />)
        expect(screen.queryByTestId(TEST_ID_MARKER)).not.toBeInTheDocument()
      })
    })
  })
})
