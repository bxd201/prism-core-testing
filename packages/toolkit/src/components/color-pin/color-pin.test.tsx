import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Color } from '../../interfaces/colors'
import ColorPin, { defaultMessages } from './color-pin'

const color = {
  id: '1234',
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

    const button = screen.getByRole('button', { name: defaultMessages.ADD })

    fireEvent.click(button)
    fireEvent.mouseDown(button)
    fireEvent.mouseUp(button)

    expect(mockOnColorAdded).toHaveBeenCalledWith(color)
  })

  test('buttons have accessible names with static labelContent', () => {
    const buttonContent = 'Button'
    const mockColorNumber = 'AB1234'
    const mockColorName = 'Color Name'

    const labelContent = (
      <>
        <p>{mockColorNumber}</p>
        <p>{mockColorName}</p>
      </>
    )

    render(
      <ColorPin
        color={color}
        buttonContent={buttonContent}
        labelContent={labelContent}
        isOpen={true}
        onColorAdded={mockOnColorAdded}
      />
    )
    expect(screen.getByText(buttonContent)).toHaveAccessibleName(
      `${defaultMessages.ADD} ${mockColorNumber} ${mockColorName}`
    )
    expect(screen.getByTestId('color-pin')).toHaveAccessibleName(`${mockColorNumber} ${mockColorName}`)
  })

  test('buttons have accessible names with function labelContent', () => {
    const buttonContent = 'Button'

    const labelContent = (color: Color): React.ReactNode => (
      <>
        <p>{color.colorNumber}</p>
        <p>{color.name}</p>
      </>
    )

    const { rerender } = render(
      <ColorPin
        color={color}
        buttonContent={buttonContent}
        labelContent={labelContent}
        isOpen={true}
        onColorAdded={mockOnColorAdded}
      />
    )
    expect(screen.getByText(buttonContent)).toHaveAccessibleName(
      `${defaultMessages.ADD} ${color.colorNumber} ${color.name}`
    )
    expect(screen.getByTestId('color-pin')).toHaveAccessibleName(`${color.colorNumber} ${color.name}`)

    rerender(
      <ColorPin
        color={color}
        buttonContent={buttonContent}
        isColorAdded
        labelContent={labelContent}
        isOpen={true}
        onColorAdded={mockOnColorAdded}
      />
    )
    expect(screen.getByText(buttonContent)).toHaveAccessibleName(
      `${defaultMessages.REMOVE} ${color.colorNumber} ${color.name}`
    )

    const customAddMessage = 'Custom add message'
    rerender(
      <ColorPin
        color={color}
        buttonContent={buttonContent}
        addButtonMessage={customAddMessage}
        labelContent={labelContent}
        isOpen={true}
        onColorAdded={mockOnColorAdded}
      />
    )
    expect(screen.getByText(buttonContent)).toHaveAccessibleName(
      `${customAddMessage} ${color.colorNumber} ${color.name}`
    )
  })
})
