describe('sw-tag-digital-color-wall', () => {
  beforeEach(() => {
    cy.visit('https://localhost:8080/prism-templates/templates/sw-com/sw-tag-digital-color-wall.html')
  })

  it('displays default color groups and swatches', () => {
    cy.get('.color-wall-chunk', { timeout: 5000 }).should('have.length', 32)
    cy.get('.color-swatch', { timeout: 5000 }).should('have.length', 1232)
  })

  it('clicks on a swatch and displays correct content', () => {
    cy.get('[aria-label="SW 7589 Habanero Chile"]').as('colorSwatch')
    cy.get('@colorSwatch').click()
    cy.get('@colorSwatch').should('have.attr', 'style').should('contain', 'background: rgb(184, 71, 61)')
    cy.get('.color-swatch__content').should('contain.text', 'Habanero Chile')
  })

  it('clicks and collapses a swatch', () => {
    cy.get('[aria-label="SW 7589 Habanero Chile"]').click()

    cy.get('.color-swatch__content').should('contain.text', 'Habanero Chile')

    cy.get('.color-wall').should('have.class', 'enter-done')

    cy.get('.zoom-out-btn').click()

    cy.get('.color-wall').should('have.class', 'exit-done')

    cy.get('.color-swatch__content').should('not.exist')
  })
})
