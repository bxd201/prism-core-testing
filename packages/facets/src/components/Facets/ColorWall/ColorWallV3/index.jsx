// @flow
import React, { useCallback } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { fullColorName, generateColorWallPageUrl } from 'src/shared/helpers/ColorUtils'
import WallRouteReduxConnector from './WallRouteReduxConnector'
import useColors from '../../../../shared/hooks/useColors'
import Prism, { ColorWall, ColorSwatch } from '@prism/toolkit'
import { Swatch } from './Swatch/Swatch'

const WALL_HEIGHT = 475
function ColorWallV3() {
  // this state allows the implementing component to control active color within Wall
  // Wall itself just calls onActivateColor when a color is chosen; it's up to the host to do
  // something with that data and provide Wall with an updated activeColorId
  const [colors, status, shape] = useColors()
  const { push } = useHistory()
  const { params } = useRouteMatch()
  const { colorId, family, section } = params
  const handleActiveColorId = useCallback(
    (id) => {
      const { brandKey, colorNumber, name } = colors.colorMap[id] || {}
      push(generateColorWallPageUrl(section, family, id, fullColorName(brandKey, colorNumber, name)))
    },
    [section, family, colors.colorMap]
  )
  const swatchRenderer = (internalProps): JSX.Element => {
    const { id, onRefMount, active, perimeterLevel } = internalProps
    const color = colors.colorMap[id]
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
      <Swatch
        {...internalProps}
        key={id}
        aria-label={color?.name}
        color={color}
        className={`${baseClass} ${activeClass} ${perimeterClasses}`}
        ref={onRefMount}
        renderer={() => (
          <div
            className='absolute p-2'
            style={{ top: '-85%', left: '-85%', width: '270%', height: '270%', transform: 'scale(0.37)' }}
          >
            <div className='relative'>
              <p className='text-sm'>{`${color.brandKey} ${color.colorNumber}`}</p>
              <p className='font-bold'>{color.name}</p>
            </div>
            <div className='flex justify-between w-full p-2.5 absolute left-0 bottom-0'>
              <button className='flex items-center ring-primary focus:outline-none focus:ring-2'>
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
    <div style={{ height: WALL_HEIGHT }}>
      <WallRouteReduxConnector>
        {!status.loading && shape ? (
          <Prism>
            <ColorWall
              shape={shape.shape}
              height={WALL_HEIGHT}
              key={shape.id}
              colorWallConfig={colorWallConfig}
              swatchRenderer={swatchRenderer}
              activeColorId={colorId}
              onActivateColor={handleActiveColorId}
            />
          </Prism>
        ) : null}
      </WallRouteReduxConnector>
    </div>
  )
}
export default ColorWallV3
