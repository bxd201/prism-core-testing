describe('ColorSwatch', () => {
  const color = { brandKey: 'SW', colorNumber: '0063', name: 'Blue Sky' }

  before(cy.visitStorybook)

  beforeEach(() => {
    cy.loadStory('ColorSwatch', 'AddToCart')
    cy.changeArg('active', false)
  })

  it('sets swatch color', () => {
    cy.changeArg('colorName', color.name)
    cy.findByLabelText(`${color.brandKey} ${color.colorNumber} ${color.name}`)
  })

  it('activates swatch', () => {
    cy.changeArg('active', true)
    cy.changeArg('colorName', color.name)
    cy.findByText(`${color.brandKey} ${color.colorNumber}`)
    cy.findByText(color.name)
    cy.findByText('Add to Cart')
  })
})
