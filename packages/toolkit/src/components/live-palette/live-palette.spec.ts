describe('LivePalette', () => {
  const initialColors = [
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
      red: 138
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
      red: 106
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
      red: 126
    }
  ]
  const [firstColor, secondColor, thirdColor] = initialColors
  const colorSlot = (colorName?: string): string | RegExp => (colorName !== undefined ? `Expand option for ${colorName} color` : /Expand option for/)
  const emptySlot = 'Empty slot'
  const colorBrandKey = (colorNumber: string): string => `SW ${colorNumber}`
  const colorDetailsButton = (colorName: string): string => `${colorName} color details`
  const removeColorButton = (colorName: string): string => `Remove color ${colorName} from live palette`
  const dragColorButton = (colorName?: string): string | RegExp => (colorName !== undefined ? `Drag color ${colorName}` : /Drag color/)
  const addColorButton = 'ADD A COLOR'

  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('LivePalette', 'ThreeColors'))

  it('sets 8 slots and renders three slot colors', () => {
    cy.changeArg('maxSlots', 8)
    cy.findAllByLabelText(colorSlot()).should('have.length', 3)
    cy.findAllByLabelText(emptySlot).should('have.length', 5)
    cy.findByText(addColorButton)
  })

  context('Color slots', () => {
    beforeEach(() =>
      cy.changeArg(
        'initialColors',
        initialColors.map((color) => color.name)
      )
    )

    it('activates second color slot / deactivates first color slot', () => {
      // activates second color slot
      cy.findByLabelText(colorSlot(secondColor.name)).click().findByText(colorBrandKey(secondColor.colorNumber))
      cy.findAllByText(secondColor.name)
      cy.findAllByLabelText(colorDetailsButton(secondColor.name))
      cy.findByLabelText(removeColorButton(secondColor.name))
      // deactivates first color slot
      cy.findByText(colorBrandKey(firstColor.colorNumber)).should('not.exist')
      cy.findByLabelText(colorDetailsButton(firstColor.name)).should('not.exist')
      cy.findByLabelText(removeColorButton(firstColor.name)).should('not.exist')
      cy.findAllByLabelText(dragColorButton()).should('have.length', 3)
    })

    it('deletes first color slot', () => {
      cy.findByLabelText(removeColorButton(firstColor.name)).click()
      cy.findAllByLabelText(colorSlot()).should('have.length', 2)
      cy.findAllByLabelText(colorSlot(secondColor.name)).findByText(colorBrandKey(secondColor.colorNumber))
      cy.findAllByText(secondColor.name)
      cy.findAllByLabelText(emptySlot).should('have.length', 6)
    })

    it('drags third slot and drops over second slot', () => {
      cy.findByLabelText(colorSlot(thirdColor.name))
        .trigger('keydown', { keyCode: 32 })
        .trigger('keydown', { keyCode: 37, force: true })
        .trigger('keydown', { keyCode: 32, force: true })
      cy.findByLabelText(colorSlot(firstColor.name)).click() // resetting initial active color
      cy.findAllByLabelText(colorSlot())
        .eq(1)
        .should('have.css', 'background-color', `rgb(${thirdColor.red}, ${thirdColor.green}, ${thirdColor.blue})`)
      cy.findAllByLabelText(colorSlot())
        .eq(2)
        .should('have.css', 'background-color', `rgb(${secondColor.red}, ${secondColor.green}, ${secondColor.blue})`)
    })

    it('renders on mobile', () => {
      cy.viewport('iphone-x')
      cy.findAllByText(colorBrandKey(firstColor.colorNumber))
      cy.findAllByText(firstColor.name)
      cy.findAllByLabelText(colorDetailsButton(firstColor.name))
      cy.findByLabelText(removeColorButton(firstColor.name)).should('have.length', 1)
      cy.findAllByLabelText(dragColorButton()).should('not.be.visible')
      cy.findByText(addColorButton).should('not.be.visible')
    })
  })

  context('Empty slots', () => {
    it('renders empty palette', () => {
      cy.loadStory('LivePalette', 'EmptyPalette')
      cy.findAllByLabelText(colorSlot()).should('not.exist')
      cy.findAllByLabelText(emptySlot).should('have.length', 8)
      cy.findByText('FIND COLORS IN THE DIGITAL COLOR WALL')
    })
  })
})
