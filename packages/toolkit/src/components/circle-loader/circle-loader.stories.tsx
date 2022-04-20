import React from 'react'
import CircleLoader from './circle-loader'

const Template = (args: {}): JSX.Element => {
  return (
    <CircleLoader {...args} />
  )
}

export const Default = Template.bind({})
Default.args = {}

export const LowesVariant = Template.bind({})
LowesVariant.args = { brandId: 'lowes' }

export default {
  title: 'CircleLoader',
  component: CircleLoader,
  argTypes: {
    brandId: {
      control: { type: 'select' },
      description: '`storybook args only`',
      options: [undefined, 'lowes']
    },
    className: {
      control: false,
      description: 'className to append to svg'
    },
    inheritSize: { control: 'boolean' },
    strokeWidth: { control: { type: 'number', min: 1, max: 50 } },
  }
}
