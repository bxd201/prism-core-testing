describe('ImageColorPicker', () => {
  before(cy.visitStorybook)

  context('Landscape Image Story Loaded', () => {
    beforeEach(() => cy.loadStory('ImageColorPicker', 'LandscapeImage'))

    it('all pins are present', () => {
      ;['Lobelia', 'Undercool', 'Cosmos', 'Hyper Blue'].forEach(s => {
        cy.findByLabelText(s)
      })
    })

    it('Undercool is open', () => cy.findByText('Undercool'))

    it('Undercool expands to the right', () => cy.findByText('Undercool').should('not.have.class', 'flex-row-reverse'))

    it('Hyper Blue is opens when clicked and expands to the left', () => {
      cy.findByLabelText('Hyper Blue').click()
      cy.findByText('Hyper Blue')
      cy.findByLabelText('Hyper Blue').children().should('have.class', 'flex-row-reverse')
    })

    it('Undercool can be added', () => {
      cy.findByLabelText('Undercool').findByLabelText('add').click()
      cy.findByLabelText('Undercool').findByLabelText('added')
    })

    it('New pin can be created', () => {
      cy.get('canvas').click('center',{ force: true })
      cy.findByLabelText('Venture Violet')
    })

    it('Undercool can be removed', () => {
      cy.findByLabelText('remove').click()
      cy.findByLabelText('Undercool').should('not.exist')
    })

    it('drag and drop Undercool changes its color', () => {
      cy.findByLabelText('Undercool')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 550, clientY: 400 })
        .trigger('mouseup')

      // undercool pin no longer exists
      cy.findByLabelText('Undercool').should('not.exist')
      // new Sapphire pin is open
      cy.findByText('Sapphire')
    })

    it('draggind Undercool to trash, removes it', () => {
      cy.findByLabelText('Undercool').trigger('mousedown').trigger('mousemove', { clientX: 475, clientY: 450 })
      cy.findByLabelText('remove').trigger('mouseup')

      // undercool pin no longer exists
      cy.findByLabelText('Undercool').should('not.exist')
    })
  })

  it('renders just an image and no pins when no colors are defined', () => {
    cy.loadStory('ImageColorPicker', 'NoDefinedColors')
    cy.findByLabelText('pick colors from image of a flower')
    ;['Lobelia', 'Undercool', 'Cosmos', 'Hyper Blue'].forEach((labelText) => {
      cy.findByLabelText(labelText).should('not.exist')
    })
  })
})
