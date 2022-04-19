import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo } from '@fortawesome/pro-solid-svg-icons'
import ColorsIcon from './colors-icon'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import { getColorContrast } from '../../utils/utils'
import { colorOptions, getRandomColorName } from '../../test-utils/test-utils'
import { filter, values } from 'lodash'

const Template = (args: { colorName: string, size: number }): JSX.Element => {
  const color = colorOptions[args.colorName] || colorOptions['A La Mode']

  return (
    <div
      aria-label='background'
      className='absolute top-0 left-0 p-4 w-full h-full'
      style={{ backgroundColor: color.hex }}
    >
      <button className='ring-primary focus:outline-none focus-visible:ring-2'>
        {color.coordinatingColors ? (
          <ColorsIcon
            aria-label={`${color.name} color details`}
            hexes={filter(colors, (c) => values(color.coordinatingColors).some((id) => id === c.id)).map((c) => c.hex)}
            /* @ts-ignore */
            onClick={() => {}}
            style={{ width: `${args.size}px`, height: `${args.size}px` }}
          />
        ) : (
          <FontAwesomeIcon aria-label='info' icon={faInfo} style={{ color: getColorContrast(color.hex) }} />
        )}
      </button>
    </div>
  )
}

export const CoordinatingColors = Template.bind({})
CoordinatingColors.args = { colorName: getRandomColorName(), size: 40 }

export default {
  title: 'ColorsIcon',
  component: ColorsIcon,
  parameters: {
    docs: {
      description: {
        component: 'If coordinating colors are undefined, it displays an info icon'
      }
    }
  },
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
    otherProps: {
      control: false,
      description: 'optional props like `aria-label`, `className`, `onClick`, `style`, and others'
    },
    size: {
      control: { type: 'number', min: 10 },
      description: 'icon size in pixels <br /> `storybook args only`'
    }
  }
}
