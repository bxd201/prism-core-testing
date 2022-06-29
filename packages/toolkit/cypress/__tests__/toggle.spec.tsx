context('Toggle', () => {
  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('Toggle', 'WithoutBackgroundColor'))

  it('can toggle', () => {
    cy.findByRole('switch').should('have.css', 'background-color', 'rgb(0, 0, 0)').click()
    cy.storyAction('toggle').should('have.been.calledWith', true)

    cy.findByRole('switch').should('have.css', 'background-color', 'rgba(0, 0, 0, 0)').click()
    cy.storyAction('toggle').should('have.been.calledWith', false)
  })
})
