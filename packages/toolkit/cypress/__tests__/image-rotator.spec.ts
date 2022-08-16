describe('ImageRotator', () => {
  const landscapeImageMetadata = {
    landscapeHeight: 640,
    landscapeWidth: 1059,
    originalImageHeight: 725,
    originalImageWidth: 1200,
    originalIsPortrait: false,
    url: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200}&qlt=92'
  }

  const rotateAngle = (angle: number): RegExp => new RegExp('rotate\\('+`${angle}`+'deg\\)')

  before(cy.visitStorybook)

  beforeEach(() => {
    cy.loadStory('ImageRotator', 'BackgroundImageLandscape')
    cy.changeArg('imageMetadata', landscapeImageMetadata)
  })

  it('loads image', () => {
    cy.findByRole('img').should('have.attr', 'src', landscapeImageMetadata.url)
    cy.findByRole('img').should(img => expect(img[0].style.transform).to.match(rotateAngle(0)))
  })

  it('rotates image', () => {
    cy.findByLabelText('clockwise').click()
    cy.findByRole('img').should(img => expect(img[0].style.transform).to.match(rotateAngle(90)))
    cy.findByLabelText('anticlockwise').click()
    cy.findByRole('img').should(img => expect(img[0].style.transform).to.match(rotateAngle(0)))
  })

  it('accepts terms and completes rotate process', () => {
    cy.findByLabelText('accept term').click()
    cy.findByText('done').click()
    cy.storyAction('ImageRotator.Button (onClick)').should('have.been.called')
  })
})
