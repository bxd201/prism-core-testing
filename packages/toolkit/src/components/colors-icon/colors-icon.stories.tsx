import React from 'react'
import { faInfo } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { filter, values } from 'lodash'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'
import ColorsIcon from './colors-icon'

const Template = (args: { colorName: string; size: number }): JSX.Element => {
  const color = colorOptions[args.colorName] || colorOptions['A La Mode']

  return (
    <div
      aria-label='background'
      className='absolute top-0 left-0 p-4 w-full h-full'
      style={{ backgroundColor: color.hex }}
    >
      <button className='ring-primary focus:outline-none focus-visible:ring-2'>
        <ColorsIcon
          aria-label={`${color.name} color details`}
          hexes={filter(colors, (c) => values(color.coordinatingColors).some((id) => id === c.id)).map((c) => c.hex)}
          infoIcon={
            <FontAwesomeIcon aria-label='info' icon={faInfo} style={{ color: color.isDark ? 'white' : 'black' }} />
          }
          style={{ width: `${args.size}px`, height: `${args.size}px` }}
        />
      </button>
    </div>
  )
}

export const CoordinatingColors = Template.bind({})
CoordinatingColors.args = { colorName: getRandomColorName(), size: 40 }

export const UndefinedCoordinatingColors = Template.bind({})
UndefinedCoordinatingColors.args = { colorName: 'White Snow', size: 30 }

export default {
  title: 'Components/ColorsIcon',
  component: ColorsIcon,
  argTypes: {
    className: { table: { disable: true } },
    colorName: {
      control: { type: 'select' },
      options: Object.keys(colorOptions).sort(),
      description: '`storybook args only`'
    },
    hexes: {
      control: false,
      description: 'coordinating hexes colors of color selected'
    },
    infoIcon: {
      control: false,
      description: 'info icon for when hexes colors are undefined'
    },
    otherProps: {
      control: false,
      description: 'optional props like `aria-label`, `className`, `style`, and others'
    },
    size: {
      control: { type: 'number', min: 10 },
      description: 'icon size in pixels <br /> `storybook args only`'
    }
  }
}
