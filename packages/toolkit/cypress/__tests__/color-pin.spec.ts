describe('ColorPin', () => {
  const color = { brandKey: 'SW', colorNumber: '0063', name: 'Blue Sky' }

  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('ColorPin', 'OpenColorPin'))

  it('sets pin color', () => {
    cy.changeArg('colorName', color.name)
    cy.findByLabelText('add')
    cy.findByText(`${color.brandKey}${color.colorNumber}`)
    cy.findByText(color.name)
  })

  it('expands pin to the left', () => {
    cy.changeArg('expandsLeft', true)
    cy.findByLabelText('add').parent().parent().should('have.class', 'flex-row-reverse')
  })

  it('adds color', () => {
    cy.changeArg('isColorAdded', true)
    cy.findByLabelText('added')
  })

  it('closes pin', () => {
    cy.changeArg('isOpen', false)
  })
})
