describe('ColorStripButton', () => {
  const colors = ['#ff0000', '#00FF00', '#0000ff', '#FFFF00', '#999999']
  const colorsInRGB = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)', 'rgb(255, 255, 0)', 'rgb(153, 153, 153)']

  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('ColorStripButton', 'WithImage'))

  it('sets colors on color strip', () => {
    cy.changeArg('colors', colors)
    cy.findAllByTestId('color-square').each((color, i) => {
      cy.wrap(color).should('have.css', 'background-color', colorsInRGB[i])
    })
  })

  it('reduces color strip to two colors', () => {
    cy.changeArg('numOfColors', 2)
    cy.findAllByTestId('color-square').should('have.length', '2')
  })

  it('changes bottom label to "Kitchen"', () => {
    cy.changeArg('bottomLabel', 'Kitchen')
    cy.findByText('Kitchen')
  })
})
