import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'

import { getColorContrast } from '../../utils/utils'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'
import ColorPin from './color-pin'

const Template = (args: { colorName: string, expandsLeft: boolean, isColorAdded: boolean, isOpen: boolean }): JSX.Element => {
  const { isColorAdded, isOpen } = args
  const color = colorOptions[args.colorName] || colorOptions['A La Mode']

  return (
    <ColorPin
      {...args}
      buttonContent={
        <FontAwesomeIcon
          aria-label={isColorAdded ? 'added' : 'add'}
          icon={isColorAdded ? faCheckCircle : faPlusCircle}
          style={{ color: getColorContrast(color.hex) }}
        />
      }
      color={color}
      labelContent={
        <>
          <p className='leading-4.5 whitespace-nowrap'>{`${color.brandKey}${color.colorNumber}`}</p>
          <p className='leading-4 font-bold whitespace-nowrap'>{color.name}</p>
        </>
      }
      style={{ top: `calc(50% - ${isOpen ? 1.5 : 1}rem)`, left: `calc(50% - ${isOpen ? 1.5 : 1}rem)` }}
    />
  )
}

export const OpenColorPin = Template.bind({})
OpenColorPin.args = { colorName: getRandomColorName(), expandsLeft: false, isColorAdded: false, isOpen: true }

export default {
  title: 'ColorPin',
  component: ColorPin,
  parameters: {
    backgrounds: {
      default: 'gray',
      values: [
        { name: 'white', value: 'white' },
        { name: 'gray', value: 'lightgray' },
        { name: 'black', value: 'black' }
      ]
    }
  },
  argTypes: {
    buttonContent: {
      control: false,
      description: 'content element of the add button'
    },
    color: { control: false },
    colorName: {
      control: { type: 'select' },
      description: '`storybook args only`',
      options: Object.keys(colorOptions).sort()
    },
    expandsLeft: {
      control: { type: 'boolean' },
      description: 'expands pin to the left or right'
    },
    isColorAdded: { control: { type: 'boolean' } },
    isOpen: { control: { type: 'boolean' } },
    labelContent: {
      control: false,
      description: 'content element of the text label'
    },
    onColorAdded: {
      action: 'onColorAdded',
      description: 'fired when the add button is clicked'
    },
    style: { table: { disable: true } }
  }
}
