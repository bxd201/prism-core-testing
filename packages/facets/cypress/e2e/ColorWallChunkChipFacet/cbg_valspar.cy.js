describe('valspar-qr-color-wall', () => {
  before(() => cy.visit('cbg/valspar-qr-color-wall.html'))

  it('displays color wall', () => {
    cy.get('.cw2__wall').as('wall')
    cy.wait(100) // waiting for rendering
    cy.get('@wall').snapshot({ name: 'wall' })
  })

  it('clicks on a swatch and displays correct content', () => {
    cy.get('.cw2__chunk--clickable').first().click()
    cy.findByLabelText('4002-9A Purple Mist').click().snapshot({ name: 'swatch' })
    cy.get('.color-swatch__content').snapshot({ name: 'swatch content' })
  })
})
