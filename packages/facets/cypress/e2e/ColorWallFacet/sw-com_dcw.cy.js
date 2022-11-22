describe('sw-tag-digital-color-wall-cwv3', () => {
  // This Color Wall test also covers sw-colorchips-color-wall and sw-colorchips-color-wall-en-ca as it uses the same wall structure and color data base
  before(() => cy.visit('sw-com/sw-tag-digital-color-wall-cwv3.html'))

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

describe('sw-tag-digital-color-wall', () => {
  // This Color Wall test also covers sw-color-visualizer-wrapper and sw-canada-en as it uses the same wall structure and color data base
  before(() => cy.visit('sw-com/sw-tag-digital-color-wall.html'))

  it('displays color wall', () => {
    cy.findAllByLabelText('grid').first().as('wall')
    cy.wait(Cypress.env('wait_time')) // waiting for rendering
    cy.get('@wall').snapshot({ name: 'wall' })
  })

  it('displays default color groups and swatches', () => {
    cy.get('.color-wall-chunk', { timeout: 5000 }).should('have.length', 32)
    cy.get('.color-swatch', { timeout: 5000 }).should('have.length', 1232)
  })

  it('clicks on a swatch and displays correct content', () => {
    cy.findByLabelText('SW 6840 Exuberant Pink').click().snapshot({ name: 'swatch' })
    cy.get('.color-swatch__content').snapshot({ name: 'swatch content' })
  })

  it('collapses a swatch', () => {
    cy.get('.color-wall').should('have.class', 'enter-done')
    cy.get('.zoom-out-btn').click()
    cy.get('.color-wall').should('have.class', 'exit-done')
    cy.get('.color-swatch__content').should('not.exist')
  })
})
