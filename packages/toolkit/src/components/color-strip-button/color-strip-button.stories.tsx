import React from 'react'
import ColorStripButton from './color-strip-button'
import ColorSwatch from '../color-swatch/color-swatch'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'
import interior from '../../test-utils/images/Interior.jpg'
import { Color } from '../../types';

interface TemplateArgs {
  bottomLabel?: string
  children?: JSX.Element
  colors: Array<{ hex: string }>
  numOfColors?: number
}
const Template = ({ bottomLabel, children, colors, numOfColors = 0 }: TemplateArgs): JSX.Element => (
  <ColorStripButton bottomLabel={bottomLabel} colors={colors.slice(0, numOfColors)}>
    {children}
  </ColorStripButton>
)

const getRandomColor = (): Color => colorOptions[getRandomColorName()] || colorOptions['A La Mode']
const getColors = (number): string[] => [...Array(number)].map(() => getRandomColor().hex)

export const WithImage = Template.bind({})
WithImage.args = {
  bottomLabel: 'Living Room',
  children: <img src={interior} style={{ width: 376, height: 211 }} />,
  colors: getColors(8),
  numOfColors: 5
}

export const WithSwatch = Template.bind({})
WithSwatch.args = {
  children: <ColorSwatch color={getRandomColor()} />,
  colors: getColors(3),
  numOfColors: 2
}

export default {
  title: 'ColorStripButton',
  component: ColorStripButton,
  argTypes: {
    children: { table: { disable: true } },
    numOfColors: {
      control: { type: 'number', min: 0, max: 8 },
      description: '`storybook args only`'
    }
  }
}
