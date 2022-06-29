describe('SimpleTintableScene', () => {
  const initialColors = [
    {
      hex: '#8ab733',
      name: 'Outrageous Green',
    },
    {
      hex: '#6a8ea1',
      name: 'Leisure Blue',
    },
    {
      hex: '#7e191b',
      name: 'Vermilion',
    }
  ]

  before(cy.visitStorybook)
  beforeEach(() => {
    cy.loadStory('SimpleTintableScene', 'Default')
  })

  context('No surfaces have colors', () => {
    beforeEach(() => {
      cy.changeArg(
        'surfaceColors',
        [],
      )
    })

    it('should render no surface colors', () => {
      cy.get('feFlood').should('have.length', 0)
    })
  })

  context('All 3 surfaces (living room) have colors', () => {
    beforeEach(() => {
      cy.changeArg(
        'surfaceColors',
        initialColors.map((color) => color.name),
      )
    })

    it('should render all 3 colors', () => {
      cy.get('feFlood').should('have.length', 3)

      cy.get('feFlood[flood-color="#8ab733"]').should('exist')
      cy.get('feFlood[flood-color="#6a8ea1"]').should('exist')
      cy.get('feFlood[flood-color="#7e191b"]').should('exist')
    })
  })
})
