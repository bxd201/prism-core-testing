import React, { useState } from 'react'
import colors from '../../test-utils/mocked-endpoints/colors.json'
import ColorWall from './color-wall'
import { mockWallShape } from '../../test-utils/mocked-endpoints/mock-shape'
import ColorSwatch from '../color-swatch/color-swatch'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Template = (args): JSX.Element => {
  const colorMap = colors.reduce((map, c) => {
    map[c.id] = c
    return map
  }, {})

  const [activeColorId, setActiveColorId] = useState(null)

  const swatchRenderer = (internalProps): JSX.Element => {
    const { id, onRefSwatch, active, perimeterLevel } = internalProps
    const color = colorMap[id]
    const activeBloom = 'z-[1001] scale-[2.66] sm:scale-[3] duration-200 shadow-swatch p-0'
    const perimeterBloom = {
      1: 'z-[958] scale-[2] sm:scale-[2.36] shadow-swatch duration-200',
      2: 'z-[957] scale-[2] sm:scale-[2.08] shadow-swatch duration-200',
      3: 'z-[956] scale-[1.41] sm:scale-[1.74] shadow-swatch duration-200',
      4: 'z-[955] scale-[1.30] sm:scale-[1.41] shadow-swatch duration-200'
    }
    const baseClass = 'shadow-[inset_0_0_0_1px_white] focus:outline focus:outline-[1.5px] focus:outline-primary'
    const activeClass = active ? activeBloom : ''
    const perimeterClasses: string = perimeterLevel > 0 ? perimeterBloom[perimeterLevel] : ''

    return (
      <ColorSwatch
        {...internalProps}
        key={id}
        aria-label={color?.name}
        color={color}
        className={`${baseClass} ${activeClass} ${perimeterClasses}`}
        ref={onRefSwatch}
        renderer={() => (
          <div
            className='absolute p-2'
            style={{ top: '-85%', left: '-85%', width: '270%', height: '270%', transform: 'scale(0.37)' }}
          >
            <div className='relative'>
              <p className='text-sm'>{`${color.brandKey as number} ${color.colorNumber as number}`}</p>
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
  }
  const colorWallConfig = {
    bloomEnabled: true
  }

  return (
    <ColorWall
      shape={mockWallShape}
      colorWallConfig={colorWallConfig}
      swatchRenderer={swatchRenderer}
      activeColorId={activeColorId}
      onActivateColor={(id) => setActiveColorId(id)}
      key={1}
    />
  )
}

export const AllColors = Template.bind({})
AllColors.args = {}
// TODO Create additional stories
// export const SherwinWilliamsColors = Template.bind({})
// SherwinWilliamsColors.args = {
//   chunkWidth: 7,
//   gridWidth: 8,
//   singleChunk: false,
//   section: 'Sherwin-Williams Colors',
//   wrappingEnabled: false
// }
//
// export const MakeAHouseShape = Template.bind({})
// HistoricColors.args = {
//   chunkHeight: 10,
//   gridWidth: 2,
//   singleChunk: false,
//   section: 'Historic Colors',
//   wrappingEnabled: true
// }
export default {
  title: 'ColorWallV3',
  component: ColorWall,
  argTypes: {}
}
