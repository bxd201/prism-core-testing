import React, { useContext } from 'react'
import Prism, { LivePalette, ColorsIcon } from '@prism/toolkit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfo, faTrash } from '@fortawesome/pro-solid-svg-icons'
import { faPlusCircle } from '@fortawesome/pro-light-svg-icons'
import { filter, values } from 'lodash'
import { withColorData } from './withColorData'
import { Color } from '../types'
import Context from "../context"

const LivePaletteWrapper = ({ colors }: { colors: Color[]}) => {
  const { lpColors, resetLpColors } = useContext(Context)

  return (
    <Prism>
      <LivePalette
        addButtonRenderer={colors => (
          <button className='h-full' onClick={() => { console.log('"Add a Color" button triggered') }} style={{ width: 'inherit' }}>
            <div className={`flex justify-center items-center ${colors.length === 0 ? '' : 'flex-col'}`}>
              <FontAwesomeIcon icon={faPlusCircle} size='lg' />
              <p className={`hidden md:block ${colors.length === 0 ? 'm-1.5 text-left' : 'm-1'} text-2xs`}>
                {colors.length === 0 ? <>FIND COLORS IN<br /> THE DIGITAL COLOR WALL</> : 'ADD A COLOR'}
              </p>
            </div>
          </button>
        )}
        // @ts-ignore
        colors={lpColors}
        deleteButtonRenderer={({ name }, onClick) => (
          <button className='md:ml-1 ring-primary focus:outline-none focus-visible:ring-2' onClick={onClick}>
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: '20px'}} />
          </button>
        )}
        detailsButtonRenderer={({ coordinatingColors, name }) => (
          <button
            className='mx-0.5 ring-primary focus:outline-none focus-visible:ring-2'
            onClick={() => { console.log('Details button triggered') }}
          >
            <ColorsIcon
              className='w-5 h-5'
              hexes={filter(colors, (c) => values(coordinatingColors).some((id) => id === c.id)).map((c) => c.hex)}
              infoIcon={<FontAwesomeIcon icon={faInfo} style={{ margin: '0 0.25rem' }} />}
            />
          </button>
        )}
        emptySlotRenderer={() => (
          <div className='flex h-full items-center justify-center opacity-60 bg-light cursor-default' style={{ width: 'inherit' }}>
            <FontAwesomeIcon icon={faPlusCircle} size='lg' />
          </div>
        )}
        labelRenderer={({ brandKey, colorNumber, name }) => (
          <div className='text-xs'>
            <p className='whitespace-nowrap'>{`${brandKey} ${colorNumber}`}</p>
            <p className='whitespace-nowrap md:font-bold'>{name}</p>
          </div>
        )}
        onColorsChanged={(colors) => resetLpColors(colors)}
      />
    </Prism>
  )
}

export default withColorData(LivePaletteWrapper)
