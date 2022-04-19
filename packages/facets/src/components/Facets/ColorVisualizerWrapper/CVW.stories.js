import { createCVWFacet } from '../../../stories/CVW/CVWFacet'
import { colorWallBgColor, language, maxSceneHeight, prismVersion, selectedColorFamily } from '../../../stories/shared/sharedArgTypes'
import { handlePromptForPRISMVersion } from '../../../stories/shared/utils'

export default {
  title: 'Color Visualizer Wrapper/Facet',
  argTypes: {
    colorWallBgColor,
    language,
    selectedColorFamily,
    maxSceneHeight,
    prismVersion
  }
}

const defaultArgs = {
  colorWallBgColor: '#FFFFFF',
  language: 'en-US',
  selectedColorFamily: 'red',
  maxSceneHeight: '640',
  prismVersion: handlePromptForPRISMVersion('2.3.1-develop')
}

const Template = (args) => createCVWFacet(args)
export const SherwinCVW = Template.bind({})
SherwinCVW.args = { ...defaultArgs }
