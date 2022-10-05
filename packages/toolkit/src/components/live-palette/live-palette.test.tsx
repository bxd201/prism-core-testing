import React from 'react'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { faInfo, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fireEvent, render, screen } from '@testing-library/react'
import { Color } from '../../types'
import LivePalette from './live-palette'

describe('LivePalette Component', () => {
  const colors = [
    {
      blue: 51,
      brandKey: 'SW',
      colorNumber: '6922',
      coordinatingColors: {
        coord1ColorId: '1631',
        coord2ColorId: '2042'
      },
      green: 183,
      hex: '#8ab733',
      id: '2608',
      name: 'Outrageous Green',
      red: 138,
      hue: 0.22348484848484848,
      saturation: 0.564102564102564,
      lightness: 0.45882352941176474,
      ignore: false,
      isDark: false
    },
    {
      blue: 161,
      brandKey: 'SW',
      colorNumber: '6515',
      coordinatingColors: {
        coord1ColorId: '2869',
        coord2ColorId: '11217',
        whiteColorId: '2198'
      },
      green: 142,
      hex: '#6a8ea1',
      id: '2202',
      name: 'Leisure Blue',
      red: 106,
      hue: 0.5575757575757575,
      saturation: 0.22633744855967075,
      lightness: 0.5235294117647059,
      ignore: false,
      isDark: false
    },
    {
      blue: 27,
      brandKey: 'SW',
      colorNumber: '2914',
      coordinatingColors: {
        coord1ColorId: '1939',
        coord2ColorId: '2754'
      },
      green: 25,
      hex: '#7e191b',
      id: '3068',
      name: 'Vermilion',
      red: 126,
      hue: 0.9966996699669967,
      saturation: 0.6688741721854305,
      lightness: 0.296078431372549,
      ignore: false,
      isDark: true
    }
  ]
  const [firstColor, secondColor, thirdColor] = colors
  const colorSlot = (colorName?: string): string | RegExp =>
    colorName !== undefined ? `Expand option for ${colorName} color` : /Expand option for/
  const emptySlot = 'Empty slot'
  const colorBrandKey = (colorNumber: string): string => `SW ${colorNumber}`
  const colorDetailsButton = (colorName: string): string => `${colorName} color details`
  const removeColorButton = (colorName: string): string => `Remove color ${colorName} from live palette`
  const addColorButton = 'ADD A COLOR'

  const deleteButtonRenderer = ({ name }, onClick): JSX.Element => (
    <button onClick={onClick}>
      <FontAwesomeIcon aria-label={removeColorButton(name)} icon={faTrash} />
    </button>
  )

  const labelRenderer = ({ brandKey, colorNumber, name }: Color): JSX.Element => (
    <>
      <p>{`${brandKey} ${colorNumber}`}</p>
      <p>{name}</p>
    </>
  )

  test('Setting 8 slots and rendering three slot colors', () => {
    render(
      <LivePalette
        addButtonRenderer={() => (
          <button>
            <div className={`flex justify-center items-center`}>
              <FontAwesomeIcon icon={faPlusCircle} size='lg' />
              <p className={`hidden md:block`}>{addColorButton}</p>
            </div>
          </button>
        )}
        colors={colors}
        maxSlots={8}
        slotAriaLabel={({ name }) => colorSlot(name).toString()}
      />
    )

    expect(screen.getAllByLabelText(colorSlot())).toHaveLength(3)
    expect(screen.getAllByLabelText(emptySlot)).toHaveLength(5)
    expect(screen.getByText(addColorButton)).toBeInTheDocument()
  })

  test('When second color slot is activated, previous color slot is deactivated', () => {
    render(
      <LivePalette
        colors={colors}
        deleteButtonRenderer={deleteButtonRenderer}
        detailsButtonRenderer={({ name }) => (
          <button>
            <FontAwesomeIcon aria-label={colorDetailsButton(name)} icon={faInfo} />
          </button>
        )}
        labelRenderer={labelRenderer}
        slotAriaLabel={({ name }) => colorSlot(name).toString()}
      />
    )

    fireEvent.click(screen.getByLabelText(colorSlot(secondColor.name)))

    // activates second color slot
    expect(screen.getAllByText(colorBrandKey(secondColor.colorNumber))[1]).toBeInTheDocument()
    expect(screen.getAllByText(secondColor.name)[1]).toBeInTheDocument()
    expect(screen.getAllByLabelText(colorDetailsButton(secondColor.name))[1]).toBeInTheDocument()
    expect(screen.getByLabelText(removeColorButton(secondColor.name))).toBeInTheDocument()
    // deactivates first color slot
    expect(screen.queryByText(colorBrandKey(firstColor.colorNumber))).not.toBeInTheDocument()
    expect(screen.queryByText(firstColor.name)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(colorDetailsButton(firstColor.name))).not.toBeInTheDocument()
    expect(screen.queryByLabelText(removeColorButton(firstColor.name))).not.toBeInTheDocument()
  })

  test('If third color slot can be activated with keyboard navigation', () => {
    render(
      <LivePalette
        colors={colors}
        labelRenderer={labelRenderer}
        slotAriaLabel={({ name }) => colorSlot(name).toString()}
      />
    )

    fireEvent.keyDown(screen.getByLabelText(colorSlot(thirdColor.name)), { key: 'Enter', code: 13 })

    expect(screen.getAllByText(colorBrandKey(thirdColor.colorNumber))[1]).toBeInTheDocument()
    expect(screen.getAllByText(thirdColor.name)[1]).toBeInTheDocument()
  })

  test('When first color slot is deleted', () => {
    render(
      <LivePalette
        colors={colors}
        deleteButtonRenderer={deleteButtonRenderer}
        labelRenderer={labelRenderer}
        slotAriaLabel={({ name }) => colorSlot(name).toString()}
      />
    )

    fireEvent.click(screen.getByLabelText(removeColorButton(firstColor.name)))

    expect(screen.getAllByLabelText(colorSlot())).toHaveLength(2)
    expect(screen.getAllByText(colorBrandKey(secondColor.colorNumber))[1]).toBeInTheDocument()
    expect(screen.getAllByText(secondColor.name)[1]).toBeInTheDocument()
    expect(screen.getAllByLabelText(emptySlot)).toHaveLength(6)
  })

  test('Palette with empty slots', () => {
    render(<LivePalette colors={[]} />)

    expect(screen.getAllByLabelText(emptySlot)).toHaveLength(8)
    expect(screen.queryByLabelText(colorSlot())).not.toBeInTheDocument()
  })
})
