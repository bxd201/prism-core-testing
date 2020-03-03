// @flow
import React, { useMemo } from 'react'
import { tinycolor } from '@ctrl/tinycolor'
import sortBy from 'lodash/sortBy'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'

import './Swatches.scss'

type SwatchProps = {
  color: string
}

const Swatch = (props: SwatchProps) => {
  const {
    color
  } = props

  return (
    <div className='Swatches__swatch' style={{ background: color }} />
  )
}

type RgbArr = number[]

type SwatchesProps = {
  palette: RgbArr[]
}

const Swatches = (props: SwatchesProps) => {
  const {
    palette
  } = props

  const processedPalette = useMemo(() => {
    if (palette) {
      return sortBy(palette.map((rgb: RgbArr) => tinycolor(`rgb(${rgb.join(',')})`)).filter(tc => {
        const sat = tc.toHsl().s
        // colors need to be at least 50% saturated to be considered part of our palette
        return sat > 0.2
      }), tc => {
        // order from most to least saturated
        return 1 - tc.toHsl().s
      })
    }
  }, [ palette ])

  return (
    <div className='Swatches'>
      {processedPalette && processedPalette.length
        ? processedPalette.map((col, i) => <Swatch key={i} color={col.toHexString()} />)
        : <p>No suitable colors found.</p>
      }
    </div>
  )
}

export default ColorDataWrapper(Swatches)
