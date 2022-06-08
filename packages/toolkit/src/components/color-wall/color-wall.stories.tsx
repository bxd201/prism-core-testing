import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchMinus } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import ColorWall from './color-wall'
import ColorSwatch from '../color-swatch/color-swatch'
import { Color } from '../../types'
import { flatten, omit, orderBy } from 'lodash'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import warmRedColors from '../../test-utils/mocked-endpoints/warm-red-colors.json'
import sections from '../../test-utils/mocked-endpoints/families.json'
import brights from '../../test-utils/mocked-endpoints/brights.json'
import chunks from '../../test-utils/mocked-endpoints/chunks.json'

const transpose = (matrix): string[][] => matrix[0].map((_, col) => matrix.map((row) => row[col]))

const unChunkedChunksMap = (type): Color[][] => {
  const chunkNames: any = type === 'family' ? sections.find(({ name }) => name === 'Sherwin-Williams Colors').families : sections

  return chunkNames.reduce((map, value) => {
    const getChunk = (el): any => type === 'family' ? el === 'name' ? value : [value] : value[el]

    return {
      ...map,
      [getChunk('name')]: [
        // bright chunks go first
        ...getChunk('families').flatMap((family) => brights[family]),
        // normal chunks go next but transposed so that each family will be in it's own column
        ...flatten(transpose(getChunk('families').map((family) => chunks.values[family])))
      ]
    }
  }, {})
}

const colorMap = colors.reduce((map, c) => {
  map[c.id] = c
  return map
}, {})

const order = { Descending: 'desc', Ascending: 'asc'}

const Template = (args): JSX.Element => {
  const getColors = (map): Color[][] => {
    const colors = map.map((chunk) => chunk.map(id => colorMap[id]))
    return args.singleChunk ? [orderBy([...flatten(colors)], args.sortBy?.toLowerCase(), order[args.orderBy])] : colors
  }

  // Places hash on color hex when it doesn't have that
  const hashesColorHex = (colors): Color[] => colors.map(color => ({ ...color, hex: `#${String(color.hex.replace(/#/g, ''))}` }))

  return (
    <ColorWall
      {...omit(args, 'family', 'orderBy', 'section', 'singleChunk', 'sortBy')}
      colors={args.colors && args.colors.length > 0
        ? [orderBy(hashesColorHex(args.colors), args.sortBy?.toLowerCase(), order[args.orderBy])]
        : args.family ? getColors(unChunkedChunksMap('family')[args.family]) : getColors(unChunkedChunksMap('section')[args.section])
      }
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
SherwinWilliamsColors.args = { chunkWidth: 7, gridWidth: 8, singleChunk: false, section: 'Sherwin-Williams Colors', wrappingEnabled: false }

export const HistoricColors = Template.bind({})
HistoricColors.args = { chunkHeight: 10, gridWidth: 2, singleChunk: false, section: 'Historic Colors', wrappingEnabled: true }

export const EmeraldColors = Template.bind({})
EmeraldColors.args = { chunkWidth: 5, gridWidth: 5, singleChunk: false, section: 'Emerald Designer Edition', wrappingEnabled: true }

export const LivingWellColors = Template.bind({})
LivingWellColors.args = { chunkWidth: 4, gridWidth: 6, singleChunk: false, section: 'Living Well Colors', wrappingEnabled: true }

export const SingleChunkEmeraldColors = Template.bind({})
SingleChunkEmeraldColors.args = { chunkWidth: 20, gridWidth: 1, singleChunk: true, section: 'Emerald Designer Edition', wrappingEnabled: false }

export const SingleChunkRedColors = Template.bind({})
SingleChunkRedColors.args = { chunkWidth: 20, gridWidth: 1, singleChunk: true, family: 'Red', section: 'Sherwin-Williams Colors', sortBy: 'Lightness', orderBy: 'Ascending', wrappingEnabled: false }

export const WarmRedRedColors = Template.bind({})
WarmRedRedColors.args = {  chunkWidth: 20, gridWidth: 1, sortBy: 'Lightness', orderBy: 'Ascending', colors: warmRedColors }

export default {
  title: 'ColorWall',
  component: ColorWall,
  argTypes: {
    chunkHeight: {
      control: { type: 'range', min: 1, max: 20 },
      description: 'number of cell rows in every chunk<br /><em>(overrides chunkWidth when defined)</em>'
    },
    chunkWidth: {
      control: { type: 'range', min: 1, max: 20 },
      description: 'number of cell columns in every chunk'
    },
    colors: {
      control: { type: 'array' },
      description: 'adds json color data<br /><em>(overrides family and section when defined)</em>',
    },
    family: {
      control: { type: 'select' },
      description: 'defines the family to display colors from<br /><em>(overrides section when defined)</em><br /> `storybook args only`',
      options: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Neutral', 'White & Pastel'],
    },
    gridWidth: {
      control: { type: 'range', min: 1, max: 20 },
      description: 'number of chunks columns'
    },
    orderBy: {
      control: { type: 'inline-radio' },
      description: 'order sort colors by HSL<br /> `storybook args only`',
      options: ['Ascending', 'Descending']
    },
    section: {
      control: { type: 'select' },
      description: 'defines the section to display colors from<br /> `storybook args only`',
      options: ['Sherwin-Williams Colors', 'Historic Colors', 'Emerald Designer Edition', 'Living Well Colors']
    },
    singleChunk: {
      control: { type: 'boolean' },
      description: 'displays swatches in a single chunk<br /> `storybook args only`'
    },
    sortBy: {
      control: { type: 'select' },
      description: 'sorts colors by HSL<br /> `storybook args only`',
      options: ['Hue', 'Saturation', 'Lightness'],
    },
    swatchRenderer: { control: false },
    swatchSize: { table: { disable: true } },
    wrappingEnabled: {
      control: { type: 'boolean' },
      description: "whether the color wall should wrap when it becomes wider than it's container"
    }
  }
}
