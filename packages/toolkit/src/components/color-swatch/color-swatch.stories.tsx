import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faInfo } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import ColorSwatch from './color-swatch'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'

const Template = (args: {
  colorName: string,
  buttonType: string,
  buttonText: string,
  onSwatchButtonClicked: (Color) => void,
  onInnerSwatchButtonClicked: (Color) => void,
  color: string,
}): JSX.Element => {
  const { buttonText, buttonType } = args
  const iconType = { Add: faPlusCircle, Check: faCheckCircle, Info: faInfo }
  const color = colorOptions[args.color] || colorOptions['A La Mode']

  return (
    <ColorSwatch
      color={color}
      onClick={() => args.onSwatchButtonClicked(color)}
      buttonRenderer={() => (
        <button className='flex items-center focus:outline-none' onClick={() => args.onInnerSwatchButtonClicked(color)}>
          {buttonType !== 'Just Text' && <FontAwesomeIcon icon={iconType[buttonType]} />}
          {buttonText && (
            <p
              className={`${buttonText.length > 12 ? 'text-xs' : 'text-sm'} opacity-90 ml-2 ${
                buttonType === 'Just Text' ? 'hover:underline' : ''
              }`}
            >
              {buttonText}
            </p>
          )}
        </button>
      )}
    />
  )
}

export const AddToCart = Template.bind({})
AddToCart.args = { buttonText: 'Add to Cart', buttonType: 'Add', color: getRandomColorName() }

export const ShowDetails = Template.bind({})
ShowDetails.args = { buttonText: 'Show Details', buttonType: 'Just Text', color: getRandomColorName() }

export const Info = Template.bind({})
Info.args = { buttonText: '', buttonType: 'Info', colorName: getRandomColorName() }

export default {
  title: 'ColorSwatch',
  component: ColorSwatch,
  argTypes: {
    color: {
      control: { type: 'select' },
      description: '`storybook args only`',
      options: Object.keys(colorOptions).sort()
    },
    buttonRenderer: {
      control: false,
      description: 'renderer function for the add/details button'
    },
    buttonText: { description: 'text displayed as part of the swatch button <br /> `storybook args only`' },
    buttonType: {
      control: { type: 'inline-radio' },
      description: 'describes the icon displayed as part of the swatch button <br /> `storybook args only`',
      options: ['Add', 'Check', 'Info', 'Just Text']
    },
    onSwatchButtonClicked: {
      action: 'onSwatchButtonClicked',
      description: 'fired when the color swatches button is clicked'
    },
    style: { control: false },
    // actions
    onInnerSwatchButtonClicked: {
      action: 'inner swatch button clicked',
      description: 'fired when the inner button of a swatch is clicked'
    }
  }
}
