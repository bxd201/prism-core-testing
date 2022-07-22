import React from 'react'
import SpinnerLoader from './spinner-loader'

const Template = (args: {}): JSX.Element => {
  return (
    <SpinnerLoader {...args} />
  )
}

export const Default = Template.bind({})
Default.args = {}

export default {
  title: 'SpinnerLoader',
  component: SpinnerLoader,
  argTypes: {
    inheritSize: { control: 'boolean' }
  }
}
