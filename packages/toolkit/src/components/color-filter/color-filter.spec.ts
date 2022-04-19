import colorsSample from '../../test-utils/mocked-endpoints/colors-sample.json'

describe('ColorFilter', () => {
  before(cy.visitStorybook)

  context('Rich colors sample filter setup', () => {
    // Mock objects (only a sample)
    const richColorFilterSetup = {
      setupDownloadLabel: 'Rich',
      hue: { start: 0, end: 100 },
      saturation: { start: 24, end: 100 },
      lightness: { start: 15, end: 32 }
    }
    const richColorFilterData = [
      {
        colorNumber: '9530',
        name: 'Momentum',
        hue: 0.11594202898550728,
        saturation: 0.33333333333333337,
        lightness: 0.27058823529411763,
        '...': '...'
      },
      { '...': '...' }
    ]

    beforeEach(() => {
      cy.loadStory('ColorFilter', 'Rich')
      cy.viewport(1000, 750)
      cy.changeArg('colors', colorsSample)
    })

    it('sets "Hue" controls to start in 5% and to end in 62%', () => {
      cy.changeArg('hueStart', 10)
      cy.changeArg('hueEnd', 40)
      cy.findByLabelText('filteredin').findAllByLabelText(/SW/).should('have.length', 8)
    })

    it('sets setupDownloadLabel and download/read files', () => {
      cy.changeArg('setupDownloadLabel', 'Rich')
      cy.findByText(/Rich/)
      // Setup
      cy.findAllByText('DOWNLOAD').first().click()
      cy.readFile('cypress/downloads/Rich HSL Color Filter setup.json').then((obj) => {
        expect(obj.setupDownloadLabel).to.eq(richColorFilterSetup.setupDownloadLabel)
        expect(obj.saturation.start).to.eq(richColorFilterSetup.saturation.start)
        expect(obj.lightness.end).to.eq(richColorFilterSetup.lightness.end)
      })
      // Data
      cy.findAllByText('DOWNLOAD').last().click()
      cy.readFile('cypress/downloads/Rich HSL Color Filter data.json').then((obj) => {
        expect(obj[0].colorNumber).to.eq(richColorFilterData[0].colorNumber)
        expect(obj[0].hue).to.eq(richColorFilterData[0].hue)
        expect(obj[0].lightness).to.eq(richColorFilterData[0].lightness)
      })
    })
  })

  context('Filtering colors manually', () => {
    const exuberantPinkAriaLabel = 'SW 6840 Exuberant Pink'
    const eminentBronzeAriaLabel = 'SW 6412 Eminent Bronze'
    const luckyGreenAriaLabel = 'SW 6926 Lucky Green'

    before(() => {
      cy.loadStory('ColorFilter', 'hsl')
      cy.changeArg('colors', colorsSample)
      cy.changeArg('saturationEnd', 30)
    })

    beforeEach(() => cy.viewport(1000, 750))

    it('moves "Exuberant Pink" color to Filtered In', () => {
      // eslint-disable-next-line
      cy.wait(50)
      cy.findByLabelText(exuberantPinkAriaLabel).click()
      cy.findByLabelText('filterin').click()
      cy.findByLabelText('filteredin')
        .findAllByLabelText(/SW/)
        .last()
        .should('have.attr', 'aria-label', exuberantPinkAriaLabel)
    })

    it('sets "Saturation" control up', () => {
      cy.changeArg('saturationEnd', 40)
      cy.findByLabelText('filteredin')
        .findAllByLabelText(/SW/)
        .last()
        .should('have.attr', 'aria-label', exuberantPinkAriaLabel)
    })

    it('removes "Eminent Bronze" color to Filtered Out', () => {
      // eslint-disable-next-line
      cy.wait(50)
      cy.findByLabelText(eminentBronzeAriaLabel).click()
      cy.findByLabelText('filterout').click()
      cy.findByLabelText('filteredout')
        .findAllByLabelText(/SW/)
        .last()
        .should('have.attr', 'aria-label', eminentBronzeAriaLabel)
    })

    it('resets "Exuberant Pink" color to default', () => {
      // eslint-disable-next-line
      cy.wait(50)
      cy.findByLabelText(exuberantPinkAriaLabel).click()
      cy.findByLabelText('reset').click()
      cy.findByLabelText('filteredin')
        .findAllByLabelText(/SW/)
        .last()
        .should('not.have.attr', 'aria-label', exuberantPinkAriaLabel)
    })

    it('filters in by color number "6926"', () => {
      cy.changeArg('filterInByColorNumber', [6926])
      // eslint-disable-next-line
      cy.wait(75)
      cy.findByLabelText('filteredin')
        .findAllByLabelText(/SW/)
        .last()
        .should('have.attr', 'aria-label', luckyGreenAriaLabel)
    })

    it('resets "6926" color to default / shows warning', () => {
      // eslint-disable-next-line
      cy.wait(75)
      cy.findByLabelText(luckyGreenAriaLabel).click()
      cy.findByLabelText('reset').click()
      cy.findByText('Color number 6926 is on filterInByColorNumber. It can only be managed from its control.')
    })
  })
})
