import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faInfo } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import ColorSwatch, { ColorSwatchProps } from './color-swatch'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'
import { Color } from '../../types'

interface ControlArgs {
  colorName: string,
  buttonText?: string,
  buttonType?: string,
  height: number,
  onSwatchClick: () => void,
  onSwatchButtonClick: () => void,
  width: number
}

const Template = (args: ColorSwatchProps & ControlArgs): JSX.Element => {
  const { buttonText, buttonType, height, width } = args
  const color: Color = colorOptions[args.colorName] || colorOptions['A La Mode']
  const iconType = { Add: faPlusCircle, Check: faCheckCircle, Info: faInfo }

  return (
    <ColorSwatch
      active={args.active}
      aria-label={`${color.brandKey} ${color.colorNumber} ${color.name}`}
      color={color}
      className='border-white border-2 ring-primary focus:outline-none focus:ring-2'
      onClick={args.onSwatchClick}
      renderer={() => (
        <>
          <div className='relative'>
            <p className='text-sm'>{`${color.brandKey} ${color.colorNumber}`}</p>
            <p className='font-bold'>{color.name}</p>
          </div>
          <div className='flex justify-between w-full p-2.5 absolute left-0 bottom-0'>
            <button className='flex items-center ring-primary focus:outline-none focus:ring-2' onClick={args.onSwatchButtonClick}>
              {buttonType !== 'Just Text' && <FontAwesomeIcon className='text-xl' icon={iconType[buttonType]} />}
              {buttonText && (
                <p className={`${buttonText.length > 12 ? 'text-xs' : 'text-sm'} ${buttonType === 'Just Text' ? 'hover:underline' : 'ml-2'}`}>
                  {buttonText}
                </p>
              )}
            </button>
          </div>
        </>
      )}
      style={{ height, width }}
    />
  )
}

export const AddToCart = Template.bind({})
AddToCart.args = { active: true, buttonText: 'Add to Cart', buttonType: 'Add', colorName: getRandomColorName(), height: 160, width: 160 }

export const Info = Template.bind({})
Info.args = { active: true, buttonText: '', buttonType: 'Info', colorName: getRandomColorName(), height: 145, width: 145 }

export const OnlyLabel = Template.bind({})
OnlyLabel.args = { active: true, buttonText: '', buttonType: 'Just Text', colorName: getRandomColorName(), height: 120, width: 120 }

export const ShowDetails = Template.bind({})
ShowDetails.args = { active: true, buttonText: 'Show Details', buttonType: 'Just Text', colorName: getRandomColorName(), height: 200, width: 200 }

export default {
  title: 'ColorSwatch',
  component: ColorSwatch,
  argTypes: {
    activeFocus: {
      control: false,
      description: 'active swatch focus',
      table: { defaultValue: { summary: `true` } }
    },
    buttonText: { description: 'text displayed as part of the swatch button <br /> `storybook args only`' },
    buttonType: {
      control: { type: 'inline-radio' },
      description: 'describes the icon displayed as part of the swatch button <br /> `storybook args only`',
      options: ['Add', 'Check', 'Info', 'Just Text']
    },
    color: { control: false },
    colorName: {
      control: { type: 'select' },
      description: '`storybook args only`',
      options: Object.keys(colorOptions).sort()
    },
    id: { control: false },
    height: { description: '`storybook args only`' },
    onSwatchButtonClick: {
      action: 'onSwatchButtonClick',
      description: 'fired when swatch inner button is clicked <br /> `storybook args only - actions`'
    },
    onSwatchClick: {
      action: 'onSwatchClick',
      description: 'fired when swatch is clicked <br /> `storybook args only - actions`'
    },
    otherProps: { description: 'optional props like `aria-label`, `className`, and `style`' },
    renderer: { description: 'renderer callback function of swatch content' },
    width: { description: '`storybook args only`' }
  }
}
