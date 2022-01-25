import { createFastMaskFacet } from './FastMaskFacet'
import { createFastMaskWithColorSelect } from './FastMaskFacetWithColorSelect'
import { maxSceneHeight, groupNames } from '../shared/sharedArgTypes'

export default {
  title: 'FastMask/Facet',
  argTypes: {
    groupNames,
    forceSquare: {
      control: 'text',
      description: 'A number that determines the width and heigth of the image resize and crop.'
    },
    showLoader: {
      control: 'text',
      description: 'If set to "true" it will show the loader animation.'
    },
    sceneName: {
      control: 'text',
      description: 'A unique name to describe the original image.'
    },
    defaultImage: {
      control: 'text',
      description: 'An URL to an image to display as the initial image.'
    },
    defaultMask: {
      control: 'text',
      description: '(optional) A URL to a PNG mask used to tint the default image.  If unspecified, the image will not be tinted.'
    },
    maxSceneHeight,
    uploadButtonText: {
      control: 'text',
      description: 'This sets the text of the upload button. It will also show the PhosphorIcon download glyph instead of the default one. When unspecified it will read "Upload a Photo'
    },
    color: {
      control: 'text',
      description: 'The color of the tinted surface, additional examples: SW-6903, SW-6780, SW-6230'
    }
  }
}

const defaultArgs = {
  groupNames: '[colors]',
  forceSquare: '500',
  showLoader: 'true',
  sceneName: 'A lovely living room',
  defaultImage: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200}&qlt=92',
  defaultMask: 'https://sherwin.scene7.com/is/image/sw?src=ir{swRender/hd_livingroom2?wid=1200&req=object&opac=100&fmt=png8&object=wall&color=000000}&fmt=png8&bgColor=FFFFFF&op_invert=1',
  maxSceneHeight: '640',
  uploadButtonText: 'Pick a Picture',
  color: 'SW-6903',
  prismVersion: '2.3.1-develop'

}

const Template = (args) => createFastMaskFacet(args)
export const FastMaskUX = Template.bind({})
FastMaskUX.args = { ...defaultArgs }

const TemplateWithColorSelect = (args) => createFastMaskWithColorSelect(args)
export const FastMaskWithColorSelect = TemplateWithColorSelect.bind({})
FastMaskWithColorSelect.args = { ...defaultArgs }
