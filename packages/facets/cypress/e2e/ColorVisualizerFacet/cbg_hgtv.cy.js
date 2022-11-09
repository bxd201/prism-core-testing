describe('hgtv-color-visualizer-wrapper-cwv3', () => {
  context('Color Wall', () => {
    before(() => cy.visit('cbg/hgtv-color-visualizer-wrapper-cwv3.html'))

    it('displays color wall', () => {
      cy.findByTestId('wall-height-div').as('wall')
      cy.wait(100) // waiting for rendering
      cy.get('@wall').snapshot({ name: 'wall' })
    })

    it('clicks on a swatch and displays correct content', () => {
      cy.findByTestId('wall-color-swatch-1').click().snapshot({ name: 'swatch' })
      cy.findByTestId('inner-swatch-1').snapshot({ name: 'swatch content' })
    })
  })
})
