import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import ColorSwatch from './color-swatch'
import { Color } from '../../types'
import '@testing-library/jest-dom'

const ID = 11331
const TEST_ID_INNER_SWATCH = `inner-swatch-${ID}`

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

  test('Setting the activeFocus to false removes the outline from the swatch', () => {
    render(<ColorSwatch active={true} color={colorObj} activeFocus={false} id={ID} />)
    expect(screen.getByTestId(TEST_ID_INNER_SWATCH)).toHaveStyle('outline: none')
  })

  test('Swatch text is light or dark depending on if color is dark or light', () => {
    const { rerender } = render(
      <ColorSwatch active={true} color={{ ...colorObj, isDark: false }} activeFocus={false} id={ID} />
    )
    expect(screen.getByTestId(TEST_ID_INNER_SWATCH)).toHaveClass('text-black')
    rerender(<ColorSwatch active={true} color={{ ...colorObj, isDark: true }} activeFocus={false} id={ID} />)
    expect(screen.getByTestId(TEST_ID_INNER_SWATCH)).toHaveClass('text-white')
  })
})
