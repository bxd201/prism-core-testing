describe('CircleLoader', () => {
  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('CircleLoader', 'Default'))

  it('renders without error', () => {
    cy.findByTestId('circle-loader').should('exist')
  })

  it('should render spinner-loader when brand is Lowes', () => {
    cy.changeArg('brandId', 'lowes')
    cy.findByTestId('spinner-loader').should('exist')
    cy.findByTestId('circle-loader').should('not.exist')
  });
})
