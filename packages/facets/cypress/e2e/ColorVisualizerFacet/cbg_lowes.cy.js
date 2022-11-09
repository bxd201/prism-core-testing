describe('lowes-color-visualizer-wrapper', () => {
  context('Color Wall', () => {
    before(() => cy.visit('/cbg/lowes-color-visualizer-wrapper.html'))

    it('displays color wall', () => {
      cy.findAllByLabelText('grid').first().as('wall')
      cy.wait(100) // waiting for rendering
      cy.get('@wall').snapshot({ name: 'wall' })
    })

    it('clicks on a swatch and displays correct content', () => {
      cy.findByLabelText('1011-6 Ancient Burgundy').click().snapshot({ name: 'swatch' })
      cy.get('.color-swatch__content').snapshot({ name: 'swatch content' })
    })
  })
})
