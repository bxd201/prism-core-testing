describe('sw-colorchips-color-wall-fr-ca', () => {
  before(() => cy.visit('sw-colorchips/sw-colorchips-color-wall-fr-ca.html'))

  it('displays color wall', () => {
    cy.findByTestId('wall-height-div').as('wall')
    cy.wait(100) // waiting for rendering
    cy.get('@wall').snapshot({ name: 'wall' })
  })

  it('clicks on a swatch and displays correct content', () => {
    cy.findByTestId('wall-color-swatch-2248').click().snapshot({ name: 'swatch' })
    cy.findByTestId('inner-swatch-2248').snapshot({ name: 'swatch content' })
  })
})
