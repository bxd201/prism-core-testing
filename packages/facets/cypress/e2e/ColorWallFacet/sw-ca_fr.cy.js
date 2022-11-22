describe('sw-canada-fr', () => {
  before(() => cy.visit('sw-ca/sw-canada-fr.html'))

  it('displays color wall', () => {
    cy.findAllByLabelText('grid').first().as('wall')
    cy.wait(Cypress.env('wait_time')) // waiting for rendering
    cy.get('@wall').snapshot({ name: 'wall' })
  })

  it('clicks on a swatch and displays correct content', () => {
    cy.findByLabelText('SW 6561 Tisane de baie').click().snapshot({ name: 'swatch' })
    cy.get('.color-swatch__content').snapshot({ name: 'swatch content' })
  })
})
