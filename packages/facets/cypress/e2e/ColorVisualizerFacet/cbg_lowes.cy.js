describe('lowes-color-visualizer-wrapper', () => {
  context('Color Wall', () => {
    before(() => cy.visit('cbg/lowes-color-visualizer-wrapper.html'))

    it('displays color wall', () => {
      cy.get('.inner-grid').first().children().as('valspar-wall')
      cy.wait(Cypress.env('wait_time')) // waiting for rendering
      cy.get('@valspar-wall').snapshot({ name: 'valspar-wall' })

      cy.get('.inner-grid').last().children().as('hgtv-wall')
      cy.wait(Cypress.env('wait_time')) // waiting for rendering
      cy.get('@hgtv-wall').snapshot({ name: 'hgtv-wall' })
    })

    it('clicks on a swatch and displays correct content', () => {
      cy.findByLabelText('1011-6 Ancient Burgundy').click().snapshot({ name: 'swatch' })
      cy.get('.color-swatch__content').snapshot({ name: 'swatch content' })
    })
  })
})
