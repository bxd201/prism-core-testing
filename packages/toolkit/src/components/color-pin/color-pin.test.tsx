import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import ColorPin from './color-pin'

const color = {
  id: 1234,
  brandKey: 'SW',
  coordinatingColors: {},
  colorNumber: '1234',
  name: 'Cilantro',
  hex: '#000000',
  red: 255,
  green: 255,
  blue: 255,
  hue: 255,
  saturation: 255,
  lightness: 255,
  ignore: false,
  isDark: false
}

const mockOnColorAdded = jest.fn()

describe('ColorPin', () => {
  test('when isOpen is set to true to show button contents', () => {
    const buttonContent = 'Button'
    render(<ColorPin color={color} buttonContent={buttonContent} isOpen={true} onColorAdded={mockOnColorAdded} />)
    expect(screen.getByText(buttonContent)).toBeInTheDocument()
  })

  test('when add button is clicked, color added callback is called', () => {
    const buttonContent = 'Button'
    render(<ColorPin color={color} buttonContent={buttonContent} isOpen={true} onColorAdded={mockOnColorAdded} />)

    const button = screen.getByRole('button', { name: 'Button' })

    fireEvent.click(button)
    fireEvent.mouseDown(button)
    fireEvent.mouseUp(button)

    expect(mockOnColorAdded).toHaveBeenCalledWith(color)
  })
})
