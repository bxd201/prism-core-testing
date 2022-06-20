describe('Select', () => {
  before(cy.visitStorybook)

  beforeEach(() => cy.loadStory('Select', 'WithoutBackgroundColor'))

  context('Menu open', () => {
    beforeEach(() => cy.findByText('day').click())

    it('all menu options are visible and can be selected', () => {
      ;['night', 'moon cloud', 'sun haze', 'sun cloud', 'sunrise'].forEach((option, i) => {
        cy.findByText(option).click()
        // button has selected option as it's text now
        cy.findByRole('button').findByText(option)
      })
    })

    it('menu can be close by clicking button', () => {
      cy.findByRole('button').click()
      cy.findByRole('menu').should('not.exist')
    })

    it('menu can be closed by clicking outside of the select', () => {
      cy.get('#root').click()
      cy.findByRole('menu').should('not.exist')
    })
  })

  context('Dark background', () => {
    beforeEach(() => cy.changeArg('backgroundColor', '#000000'))

    it('sets text color to white', () => {
      cy.findByText('day').should('have.css', 'color', 'rgb(255, 255, 255)').click()
      ;['night', 'moon cloud', 'sun haze', 'sun cloud', 'sunrise'].forEach((option, i) => {
        cy.findByText(option).should('have.css', 'color', 'rgb(255, 255, 255)')
      })
    })
  })

  context('Light background', () => {
    beforeEach(() => cy.changeArg('backgroundColor', '#ffffff'))

    it('sets text color to black', () => {
      cy.findByText('day').should('have.css', 'color', 'rgb(0, 0, 0)').click()
      ;['night', 'moon cloud', 'sun haze', 'sun cloud', 'sunrise'].forEach((option, i) => {
        cy.findByText(option).should('have.css', 'color', 'rgb(0, 0, 0)')
      })
    })
  })
})
