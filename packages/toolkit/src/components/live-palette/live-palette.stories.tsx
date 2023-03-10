import React from 'react'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { faInfo, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { filter, shuffle, values } from 'lodash'
import colorsData from '../../test-utils/mocked-endpoints/colors.json'
import { colorOptions } from '../../test-utils/test-utils'
import { Color } from '../../types'
import ColorsIcon from '../colors-icon/colors-icon'
import LivePalette from './live-palette'

const Template = (args): JSX.Element => (
  <LivePalette
    {...args}
    addButtonRenderer={(colors: Color[]) => (
      <button className='h-full' onClick={args.onAddButtonTriggered} style={{ width: 'inherit' }}>
        <div className={`flex justify-center items-center ${colors.length === 0 ? '' : 'flex-col'}`}>
          <FontAwesomeIcon icon={faPlusCircle} size='lg' />
          <p className={`hidden md:block ${colors.length === 0 ? 'm-1.5 text-left' : 'm-1'} text-2xs`}>
            {colors.length === 0 ? (
              <>
                FIND COLORS IN
                <br /> THE DIGITAL COLOR WALL
              </>
            ) : (
              'ADD A COLOR'
            )}
          </p>
        </div>
      </button>
    )}
    className='xl:w-3/5'
    colors={(args.colors ?? []).map((colorName) => colorOptions[colorName])}
    deleteButtonRenderer={({ name }, onClick) =>
      !args.simple && (
        <button className='md:ml-1 ring-primary focus:outline-none focus-visible:ring-2' onClick={onClick}>
          <FontAwesomeIcon
            aria-label={`Remove color ${name} from live palette`}
            icon={faTrash}
            style={{ fontSize: '20px' }}
          />
        </button>
      )
    }
    detailsButtonRenderer={({ coordinatingColors, name }) =>
      !args.simple && (
        <button
          className='mx-0.5 ring-primary focus:outline-none focus-visible:ring-2'
          onClick={args.onDetailsButtonTriggered}
        >
          {coordinatingColors ? (
            <ColorsIcon
              className='w-5 h-5'
              aria-label={`${name} color details`}
              hexes={filter(colorsData, (c) => values(coordinatingColors).some((id) => id === c.id)).map((c) => c.hex)}
            />
          ) : (
            <FontAwesomeIcon icon={faInfo} style={{ margin: '0 0.25rem' }} />
          )}
        </button>
      )
    }
    emptySlotRenderer={() => (
      <div
        className='flex h-full items-center justify-center opacity-60 bg-light cursor-default'
        style={{ width: 'inherit' }}
      >
        <FontAwesomeIcon icon={faPlusCircle} size='lg' />
      </div>
    )}
    labelRenderer={({ brandKey, colorNumber, name }) => (
      <div className='text-xs'>
        <p className='whitespace-nowrap'>{`${brandKey} ${colorNumber}`}</p>
        <p className='whitespace-nowrap md:font-bold'>{name}</p>
      </div>
    )}
    slotAriaLabel={({ name }) => `Expand option for ${name} color`}
  />
)

export const EmptyPalette = Template.bind({})

export const SimplePalette = Template.bind({})
SimplePalette.args = { colors: shuffle(Object.keys(colorOptions)).filter((c, i) => i < 3), simple: true }

export const ThreeColors = Template.bind({})
ThreeColors.args = { colors: shuffle(Object.keys(colorOptions)).filter((c, i) => i < 3) }

export default {
  title: 'Components/LivePalette',
  component: LivePalette,
  argTypes: {
    activeIndex: { description: 'index of active color slot' },
    addButtonRenderer: { control: false, description: 'renderer function for the "add a color" button' },
    colors: {
      description: 'array of colors filling the palette',
      control: { type: 'multi-select', options: Object.keys(colorOptions).sort() }
    },
    deleteButtonRenderer: { control: false, description: 'renderer function for the delete button' },
    detailsButtonRenderer: { control: false, description: 'renderer function for the details button' },
    emptySlotRenderer: { control: false, description: 'renderer function for the empty slot' },
    labelRenderer: { control: false, description: 'renderer function for the text label' },
    maxSlots: { control: { type: 'range', min: 2, max: 10 }, description: 'maximum number of slots' },
    onAddButtonTriggered: { action: 'add button triggered', description: '`storybook args only`' },
    onColorActivated: { action: 'new color activated', description: 'fired when a new color becomes active' },
    onColorsChanged: {
      action: 'colors changed',
      description: 'fired when colors are changed or deleted'
    },
    onDetailsButtonTriggered: { action: 'details button triggered', description: '`storybook args only`' },
    otherProps: { control: false, description: 'optional props like `className` and `style`' },
    simple: { table: { disable: true } },
    slotAriaLabel: { control: false, description: 'slot `aria-label`' }
  }
}
