// @flow
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import tinycolor from '@ctrl/tinycolor'
import { type Color } from 'src/shared/types/Colors.js.flow'

import './Swatch.scss'

type SwatchProps = {
  color: tinycolor,
  swPalette: Color[] | typeof undefined
}

const Swatch = (props: SwatchProps) => {
  const {
    color,
    swPalette: colorMatches
  } = props

  const { colorMap } = useSelector(state => state.colors.items)
  const hex = useMemo(() => color && color.toHexString(), [ color ])

  return (
    <div className='Swatch' style={{ background: hex }}>
      <div className='Swatch__coordinating'>
        <>
          {colorMatches ? colorMatches.map((color, i) => {
            const { hex, name, coordinatingColors = {} } = color

            return (
              <ul key={i} className='Swatch__coordinating__set'>
                <li className='Swatch__coordinating__set__color Swatch__coordinating__set__color--primary' style={{ background: hex }} title={name} />
                <>
                  {Object.keys(coordinatingColors).map((key, i) => {
                    const colorId = coordinatingColors[key]
                    const { hex, name } = colorMap[colorId]

                    return (
                      <li key={i} className='Swatch__coordinating__set__color' style={{ background: hex }} title={name} />
                    )
                  })}
                </>
              </ul>
            )
          }) : 'Processing...'}
        </>
      </div>
    </div>
  )
}

export default ColorDataWrapper(Swatch)
