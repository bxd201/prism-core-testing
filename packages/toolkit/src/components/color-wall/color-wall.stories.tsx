import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchMinus } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import ColorWall from './color-wall'
import ColorSwatch from '../color-swatch/color-swatch'
import { flatten, omit } from 'lodash'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import sections from '../../test-utils/mocked-endpoints/families.json'
import brights from '../../test-utils/mocked-endpoints/brights.json'
import chunks from '../../test-utils/mocked-endpoints/chunks.json'

const transpose = (matrix): string[][] => matrix[0].map((_, col) => matrix.map((row) => row[col]))

const unChunkedChunksMap: { [name: string]: string[][] } = sections.reduce((map, { name, families }) => {
  map[name] = [
    // bright chunks go first
    ...families.flatMap((family) => brights[family]),
    // normal chunks go next but transposed so that each family will be in it's own column
    ...flatten(transpose(families.map((family) => chunks.values[family])))
  ]
  return map
}, {})

const colorMap = colors.reduce((map, c) => {
  map[c.id] = c
  return map
}, {})

const Template = (args): JSX.Element => {
  return (
    <ColorWall
      {...omit(args, 'section')}
      colors={unChunkedChunksMap[args.section].map((chunk) => chunk.map((id) => colorMap[id]))}
      zoomOutButtonRenderer={(onClick) => (
        <button
          className='flex items-center justify-center absolute top-1 right-1 z-10 bg-white w-10 h-10 rounded-full text-primary hover:bg-light focus:outline-none'
          onClick={onClick}
        >
          <FontAwesomeIcon icon={faSearchMinus} size='lg' />
        </button>
      )}
      swatchRenderer={(defaultProps) => {
        const { color }  = defaultProps

        return (
          <ColorSwatch
            {...defaultProps}
            className='border-white border-1 ring-primary focus:outline-none focus:ring-2'
            renderer={() => (
              <div className='absolute p-2' style={{ top: '-85%', left: '-85%', width: '270%', height: '270%', transform: 'scale(0.37)' }}>
                <div className='relative'>
                  <p className='text-sm'>{`${color.brandKey} ${color.colorNumber}`}</p>
                  <p className='font-bold'>{color.name}</p>
                </div>
                <div className='flex justify-between w-full p-2.5 absolute left-0 bottom-0'>
                  <button className='flex items-center ring-primary focus:outline-none focus:ring-2'>
                    <FontAwesomeIcon icon={faPlusCircle} className='mb-0.5' />
                    <p className='text-xs opacity-90 ml-2'>Add to Palette</p>
                  </button>
                </div>
              </div>
            )}
          />
        )
      }}
    />
  )
}

export const SherwinWilliamsColors = Template.bind({})
SherwinWilliamsColors.args = { chunkWidth: 7, gridWidth: 8, section: 'Sherwin-Williams Colors', wrappingEnabled: false }

export const HistoricColors = Template.bind({})
HistoricColors.args = { chunkHeight: 10, gridWidth: 2, section: 'Historic Colors', wrappingEnabled: true }

export const EmeraldColors = Template.bind({})
EmeraldColors.args = { chunkWidth: 5, gridWidth: 5, section: 'Emerald Designer Edition', wrappingEnabled: true }

export const LivingWellColors = Template.bind({})
LivingWellColors.args = { chunkWidth: 4, gridWidth: 6, section: 'Living Well Colors', wrappingEnabled: true }

export default {
  title: 'ColorWall',
  component: ColorWall,
  argTypes: {
    gridWidth: {
      control: { type: 'range', min: 1, max: 20 },
      description: 'number of chunks columns'
    },
    chunkWidth: {
      control: { type: 'range', min: 1, max: 20 },
      description: 'number of cell columns in every chunk'
    },
    chunkHeight: {
      control: { type: 'range', min: 1, max: 20 },
      description: 'number of cell rows in every chunk, overrides chunkWidth when defined'
    },
    section: {
      control: { type: 'select' },
      description: 'defines the section to display colors from',
      options: ['Sherwin-Williams Colors', 'Historic Colors', 'Emerald Designer Edition', 'Living Well Colors']
    },
    wrappingEnabled: {
      control: { type: 'boolean' },
      description: "whether the color wall should wrap when it becomes wider than it's container"
    },
    swatchSize: { table: { disable: true } },
    colors: { control: false },
    swatchRenderer: { control: false }
  }
}
