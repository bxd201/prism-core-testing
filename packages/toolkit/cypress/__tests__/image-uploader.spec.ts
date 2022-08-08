describe('ImageUploader', () => {
  const maxHeight = 500

  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('ImageUploader', 'Default'))

  it('uploads image and returns processed image metadata', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/landscape.jpg', {force: true})
    cy.findByRole('img').should('be.visible')
    cy.storyAction('processedImageMetadata').should('have.been.called')
  })

  it('displays the loader when image is being processed (heic)', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/landscape.heic', {force: true})
    cy.findByLabelText('loader')
    cy.findByRole('img').should('be.visible')
  })

  it('contrains uploaded image height', () => {
    cy.changeArg('maxHeight', maxHeight)
    cy.get('input[type=file]').selectFile('cypress/fixtures/landscape.jpg', {force: true})
    cy.findByRole('img').should('have.css', 'height', `${maxHeight}px`)
    cy.storyAction('processedImageMetadata').should('have.been.called')
  })
})
