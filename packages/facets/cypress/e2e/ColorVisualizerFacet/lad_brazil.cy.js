describe('brazil-pt-color-visualizer-wrapper-cwv3', () => {
  context('Color Wall', () => {
    before(() => cy.visit('lad/brazil-pt-color-visualizer-wrapper-cwv3.html#/active/color-wall/section/sherwin-williams-colors'))

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
})
