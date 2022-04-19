import { createColorWallFacet } from '../../stories/ColorWall/ColorWallFacet'
import { language, prismVersion, cdpPageRoot } from '../../stories/shared/sharedArgTypes'
import { handlePromptForPRISMVersion } from '../../stories/shared/utils'

export default {
  title: 'Digital ColorWall/Facet',
  argTypes: {
    language,
    cdpPageRoot,
    prismVersion
  }
}

const defaultArgs = {
  language: 'en-US',
  cpdPageRoot: 'https://www.sherwin-williams.com/homeowners/color/find-and-explore-colors/paint-colors-by-family',
  prismVersion: handlePromptForPRISMVersion('2.3.1-develop')
}

const Template = (args) => createColorWallFacet(args)
export const SherwinColorWall = Template.bind({})
SherwinColorWall.args = { ...defaultArgs }
