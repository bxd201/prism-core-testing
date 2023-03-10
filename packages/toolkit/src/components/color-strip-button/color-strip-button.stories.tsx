import React from 'react'
import interior from '../../test-utils/images/Interior.jpg'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'
import { Color } from '../../types'
import ColorSwatch from '../color-swatch/color-swatch'
import ColorStripButton from './color-strip-button'

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
const getColors = (number: number): string[] => [...Array(number)].map(() => getRandomColor().hex)

export const WithImage = Template.bind({})
WithImage.args = {
  bottomLabel: 'Living Room',
  children: <img src={interior} style={{ width: 376, height: 211 }} />,
  colors: getColors(8),
  numOfColors: 5
}

export const WithSwatch = Template.bind({})
WithSwatch.args = {
  children: <ColorSwatch active activeFocus={false} color={getRandomColor()} style={{ height: 100, width: 200 }} />,
  colors: getColors(3),
  numOfColors: 2
}

export default {
  title: 'Components/ColorStripButton',
  component: ColorStripButton,
  argTypes: {
    children: { table: { disable: true } },
    numOfColors: {
      control: { type: 'number', min: 0, max: 8 },
      description: '`storybook args only`'
    }
  }
}
