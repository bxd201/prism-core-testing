import { createTabbedScenesFacet } from '../../stories/TabbedScenes/TabbedScenesFacet'
import { createTabbedScenesWithColorSelect } from '../../stories/TabbedScenes/TabbedSceneWithColorSelect'
import { groupNames, maxSceneHeight, prismVersion } from '../../stories/shared/sharedArgTypes'
import { handlePromptForPRISMVersion } from '../../stories/shared/utils'

export default {
  title: 'Tabbed Scenes/Facet',
  argTypes: {
    groupNames,
    maxSceneHeight,
    prismVersion
  }
}

const defaultArgs = {
  groupNames: '[colors, scenes]',
  defaultColors: '[SW-9173, SW-6785, SW-6837]',
  maxSceneHeight: '640',
  prismVersion: handlePromptForPRISMVersion('2.3.1-develop')
}

const Template = (args) => createTabbedScenesFacet(args)
export const TabbedSceneUX = Template.bind({})
TabbedSceneUX.args = { ...defaultArgs }

const TemplateWithColorSelect = (args) => createTabbedScenesWithColorSelect(args)
export const TabbedSceneWithColorSelect = TemplateWithColorSelect.bind({})
TabbedSceneWithColorSelect.args = { ...defaultArgs }
