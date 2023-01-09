describe('valspar-qr-color-wall-cwv3-left-hand', () => {
  context('Color Wall', () => {
    before(() => cy.visit('cbg/valspar-qr-color-wall-cwv3-left-hand.html'))

    it('displays color wall', () => {
      cy.findByTestId('wall-height-div').as('wall')
      cy.wait(Cypress.env('wait_time') * 1.5) // waiting for rendering
      cy.get('@wall').snapshot({ name: 'wall' })
    })

    it('clicks on a chunk and on a swatch and displays correct content', () => {
      cy.findAllByTestId('wall-chunk').first().click()
      cy.findByTestId('wall-color-swatch-1345').click().snapshot({ name: 'swatch' })
      cy.findByTestId('inner-swatch-1345').snapshot({ name: 'swatch content' })
    })
  })
})
