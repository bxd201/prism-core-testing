import React from 'react'
import GenericOverlay, { GenericOverlayProps } from './generic-overlay'

const Template = (args: GenericOverlayProps): JSX.Element => {
  return (
    <GenericOverlay {...args} />
  )
}

export const Loading = Template.bind({})
Loading.args = { type: 'LOADING' }

export const Error = Template.bind({})
Error.args = { type: 'ERROR', message: 'This is the error state' }

export const Message = Template.bind({})
Message.args = { type: 'Message', message: 'This is the message state' }

export default {
  title: 'GenericOverlay',
  component: GenericOverlay,
  argTypes: {
  }
}
