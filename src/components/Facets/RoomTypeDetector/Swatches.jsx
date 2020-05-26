// @flow
import React, { useCallback } from 'react'
import Swatch from './Swatch'
import { type RGBArr, type Color } from 'src/shared/types/Colors.js.flow'

import './Swatches.scss'

type SwatchesProps = {
  onSetColor?: Function,
  palette: RGBArr[],
  swPalette: (Color[] | typeof undefined)[],
  swRecommendations: Color[]
}

const Swatches = (props: SwatchesProps) => {
  const {
    onSetColor,
    palette,
    swPalette = [],
    swRecommendations = []
  } = props

  const setColor = useCallback((color: string) => {
    return () => {
      if (onSetColor) {
        onSetColor(color)
      }
    }
  }, [ onSetColor ])

  return (
    <section className='Swatches'>
      {swRecommendations && swRecommendations.length ? (
        <div className='Swatches__recommendations'>
          <h1 className='Swatches__recommendations__title'>Recommended SW Accent Colors</h1>
          {swRecommendations.map((color: Color, i) => (
            <button className='Swatches__recommendations__swatch' key={i} style={{ background: color.hex }} onClick={setColor(color.hex)}>{color.name}</button>
          ))}
        </div>
      ) : null}
      {palette && palette.length
        ? (
          <div className='Swatches__recommendations'>
            <h1 className='Swatches__recommendations__title'>Primary Colors, SW Matches</h1>
            {palette.map((col, i) => <Swatch key={i} color={col} swPalette={swPalette[i]} />)}
          </div>
        )
        : <p>No suitable colors found.</p>
      }
    </section>
  )
}

export default Swatches
