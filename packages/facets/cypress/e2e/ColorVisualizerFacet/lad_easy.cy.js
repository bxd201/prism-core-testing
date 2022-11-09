describe('easy-es-AR-color-visualizer-wrapper', () => {
  // This Color Wall test also covers condor-es-EC-color-visualizer-wrapper as it uses the same wall structure and color data base
  context('Color Wall', () => {
    before(() => cy.visit('/lad/easy-es-AR-color-visualizer-wrapper.html#/active/color-wall/section/sherwin-williams-colors/'))

    it('displays color wall', () => {
      cy.findAllByLabelText('grid').first().as('wall')
      cy.wait(100) // waiting for rendering
      cy.get('@wall').snapshot({ name: 'wall' })
    })

    it('clicks on a swatch and displays correct content', () => {
      cy.findByLabelText('EZ 9085 Té de Fresa').click().snapshot({ name: 'swatch' })
      cy.get('.color-swatch__content').snapshot({ name: 'swatch content' })
    })
  })
})
