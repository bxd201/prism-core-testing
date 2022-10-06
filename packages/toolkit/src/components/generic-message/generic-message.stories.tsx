import React from 'react'
import GenericMessage, { GenericMessageProps, MessageTypes } from './generic-message'

interface StoryType {
  firstLine?: string
  secondLine?: string
}

export default {
  title: 'Elements/GenericMessage',
  component: GenericMessage,
  argTypes: {
    type: {
      options: Object.values(MessageTypes),
      control: { type: 'radio' }
    },
    fillParent: {
      type: 'boolean'
    },
    center: {
      type: 'boolean'
    },
    className: {
      type: 'string'
    }
  }
}

const SingleChildTemplate = (args: GenericMessageProps & StoryType): JSX.Element => (
  <GenericMessage {...args}>{args.firstLine}</GenericMessage>
)

const MultiChildTemplate = (args: GenericMessageProps & StoryType): JSX.Element => (
  <GenericMessage {...args}>
    <h3 className='font-bold'>{args.firstLine}</h3>
    <p className='text-1.5xs'>{args.secondLine}</p>
  </GenericMessage>
)

export const SingleChild = SingleChildTemplate.bind({})
SingleChild.args = {
  firstLine: 'Generic message text'
}

export const MiltiChild = MultiChildTemplate.bind({})
MiltiChild.args = {
  firstLine: 'Generic message text',
  secondLine: 'Text content'
}

export const LongContent = MultiChildTemplate.bind({})
LongContent.args = {
  firstLine: 'Generic message text',
  secondLine:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
}
