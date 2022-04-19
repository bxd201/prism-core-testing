describe('Menu', () => {
  const exploreColorsTitle = 'Explore all the ways to start building My Color Palette.'

  before(cy.visitStorybook)

  context('All features', () => {
    beforeEach(() => cy.loadStory('Menu', 'AllFeatures'))

    it('sets "Explore Colors" as initial active tab', () => {
      cy.changeArg('initialActiveTabIndex', 0)
      cy.findByText('Explore Colors').should('have.class', 'bg-secondary')
      cy.findByText(exploreColorsTitle)
    })

    it('clicks on "Help" tab and finds "Helpful Hints" title', () => {
      cy.findByText('Help').click()
      cy.findByText('Helpful Hints')
    })
  })

  context('Explore Colors opened', () => {
    beforeEach(() => {
      cy.loadStory('Menu', 'ExploreColorsTabOpened')
      cy.findByText(exploreColorsTitle)
    })

    it('closes submenu', () => {
      /* eslint-disable cypress/no-unnecessary-waiting */
      cy.wait(500) // Lazy build on server
      cy.findByText('CLOSE').click()
      cy.findByText(exploreColorsTitle).should('not.exist')
    })

    it('excludes feature submenu item "Color Collections" from "Explore Colors" menu', () => {
      cy.changeArg('featureExclusions', ['color-collections'])
      cy.findByText('color collections').should('not.exist')
    })

    it('excludes feature tab "My Ideas" from menu', () => {
      cy.changeArg('featureExclusions', ['my-ideas'])
      cy.findByText('My Ideas').should('not.exist')
    })
  })
})
