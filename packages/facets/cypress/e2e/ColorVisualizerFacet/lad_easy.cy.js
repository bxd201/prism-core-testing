describe('easy-es-AR-color-visualizer-wrapper-cwv3', () => {
  // This Color Wall test also covers condor-es-EC-color-visualizer-wrapper-cwv3 as it uses the same wall structure and color data base
  context('Color Wall', () => {
    before(() => cy.visit('lad/easy-es-AR-color-visualizer-wrapper-cwv3.html#/active/color-wall/section/sherwin-williams-colors'))

    it('displays color wall', () => {
      cy.findByTestId('wall-height-div').as('wall')
      cy.wait(Cypress.env('wait_time')) // waiting for rendering
      cy.get('@wall').snapshot({ name: 'wall' })
    })

    it('clicks on a swatch and displays correct content', () => {
      cy.findByTestId('wall-color-swatch-2248').click().snapshot({ name: 'swatch' })
      cy.findByTestId('inner-swatch-2248').snapshot({ name: 'swatch content' })
    })
  })
})
