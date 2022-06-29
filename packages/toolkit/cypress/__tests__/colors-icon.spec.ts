import colors from '../../src/test-utils/mocked-endpoints/colors.json'
import { filter, values } from 'lodash'

describe('ColorsIcon', () => {
  const color = {
    coordinatingColors: { coord1ColorId: '2847', coord2ColorId: '11312', whiteColorId: '2689' },
    hex: '#63523d',
    name: 'Pier'
  }
  const colorNoCoordinatingColors = { hex: '#f5f4ee', name: 'White Snow' }
  const ariaLabel = `${color.name} color details`
  const hex2rgb = (hex: string): string =>
    `rgb(${hex
      .substring(1)
      .match(/../g)
      .map((x, i) => `${i > 0 ? ' ' : ''}${+`0x${x}`}`)
      .join(',')})`

  before(cy.visitStorybook)

  beforeEach(() => {
    cy.loadStory('ColorsIcon', 'CoordinatingColors')
    cy.changeArg('colorName', color.name)
  })

  it('renders coordinating colors icon', () => {
    const coordColors = filter(colors, (c) => values(color.coordinatingColors).some((id) => id === c.id))
    coordColors.forEach((coordColor) => {
      cy.get(`span[style="background-color: ${hex2rgb(coordColor.hex)};"]`)
    })
  })

  it('changes icon size', () => {
    cy.changeArg('size', 20)
    cy.findByLabelText(ariaLabel).should('have.css', 'width', '20px')
  })

  it('renders info icon for undefined coordinating colors', () => {
    cy.loadStory('ColorsIcon', 'UndefinedCoordinatingColors')
    cy.changeArg('colorName', colorNoCoordinatingColors.name)
    cy.findByLabelText('background').should('have.css', 'background-color', hex2rgb(colorNoCoordinatingColors.hex))
    cy.findByLabelText('info')
  })
})
