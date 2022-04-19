import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import ColorsIcon from '../colors-icon/colors-icon'
import Palette from './palette'
import colorsData from '../../test-utils/mocked-endpoints/colors.json'
import { getColorContrast } from '../../utils/utils'
import { colorOptions } from '../../test-utils/test-utils'
import { filter, shuffle, values } from 'lodash'
import { Color } from '../../types';

const Template = (args): JSX.Element => {
  return (
    <Palette
      initialActiveIndex={args.initialActiveIndex}
      initialColors={(args.initialColors ?? []).map((colorName) => colorOptions[colorName])}
      addButtonRenderer={(colors: Color[]) => (
        <button className='w-full h-full' onClick={args.onAddButtonTriggered}>
          <div className={`flex justify-center items-center ${colors.length === 0 ? '' : 'flex-col ml-1'}`}>
            <FontAwesomeIcon icon={faPlusCircle} size='lg' />
            <p className={`hidden md:block ${colors.length === 0 ? 'm-1.5' : 'm-1'}`} style={{ fontSize: '7px' }}>
              {colors.length === 0 ? 'FIND COLORS IN THE DIGITAL COLOR WALL' : 'ADD A COLOR'}
            </p>
          </div>
        </button>
      )}
      emptySlotRenderer={() => (
        <div className='flex w-full h-full items-center justify-center opacity-60 bg-light cursor-default'>
          <FontAwesomeIcon icon={faPlusCircle} size='lg' />
        </div>
      )}
      deleteButtonRenderer={({ name, hex }, onClick) => (
        <button className='md:ml-1 ring-primary focus:outline-none focus-visible:ring-2' onClick={onClick}>
          <FontAwesomeIcon
            aria-label={`Remove color ${name} from live palette`}
            icon={faTrash}
            style={{ color: getColorContrast(hex) }}
          />
        </button>
      )}
      detailsButtonRenderer={({ coordinatingColors, hex, name }) => (
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
            <FontAwesomeIcon icon={faInfo} style={{ color: getColorContrast(hex), margin: '0 0.25rem' }} />
          )}
        </button>
      )}
      maxSlots={args.maxSlots}
      onColorActivated={args.onColorActivated}
      onColorsChanged={args.onColorsChanged}
    />
  )
}

export const ThreeColors = Template.bind({})
ThreeColors.args = { initialColors: shuffle(Object.keys(colorOptions)).filter((c, i) => i < 3) }

export const EmptyPalette = Template.bind({})

export default {
  title: 'Palette',
  component: Palette,
  subcomponents: { ColorsIcon },
  argTypes: {
    initialActiveIndex: {
      description: 'index of initially active color slot'
    },
    maxSlots: { control: { type: 'range', min: 2, max: 14 }, description: 'maximum number of slots' },
    initialColors: {
      description: 'array of colors filling the palette',
      control: { type: 'multi-select', options: Object.keys(colorOptions).sort() }
    },
    className: { table: { disable: true } },
    addButtonRenderer: { control: false, description: 'renderer function for the  "add a color" button' },
    deleteButtonRenderer: { control: false, description: 'renderer function for the "delete" button' },
    detailsButtonRenderer: { control: false, description: 'renderer function for the "details" button' },
    emptySlotRenderer: { control: false, description: 'renderer function for the "empty slot"' },
    // actions
    onColorActivated: { action: 'new color activated', description: 'fired when a new color becomes active' },
    onDetailsButtonTriggered: { action: 'details button triggered' },
    onAddButtonTriggered: { action: 'add button triggered' },
    onColorsChanged: {
      action: 'colors changed',
      description: 'fired when colors are changed using drag and drop or delete'
    }
  }
}
