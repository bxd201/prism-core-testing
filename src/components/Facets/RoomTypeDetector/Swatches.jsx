// @flow
import React, { useMemo, useState, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { tinycolor } from '@ctrl/tinycolor'
import groupBy from 'lodash/groupBy'
import flatten from 'lodash/flatten'
import debounce from 'lodash/debounce'

import Swatch from './Swatch'

import { colorMatch } from 'src/components/PaintScene/utils'

import './Swatches.scss'

type RgbArr = number[]

type SwatchesProps = {
  onSetColor?: Function,
  palette: RgbArr[]
}

const Swatches = (props: SwatchesProps) => {
  const {
    onSetColor,
    palette
  } = props

  const accents = useRef([])

  const [commonAccents, setCommonAccents] = useState()
  const { colorMap } = useSelector(state => state.colors.items)

  const setColor = useCallback((color: string) => {
    return () => {
      if (onSetColor) {
        onSetColor(color)
      }
    }
  }, [ onSetColor ])

  const reportAccents = useCallback((newAccents) => {
    if (newAccents) {
      accents.current = flatten([accents.current, newAccents]).sort()
      analyzeAccents()
    }
  }, [])

  const analyzeAccents = useCallback(debounce(() => {
    const grouped = groupBy(accents.current)
    const common = Object.keys(grouped).filter(key => grouped[key].length > 1)
    setCommonAccents(common)
  }, 100))

  const processedPalette = useMemo(() => {
    if (palette) {
      const filteredPalette = palette.map((rgb: RgbArr) => tinycolor(`rgb(${rgb.join(',')})`)).filter(tc => {
        const sat = tc.toHsl().s
        const l = tc.toHsl().l
        // colors need to be at least 5% saturated, and 20-90% light to be considered part of our palette
        return sat > 0.05 && l < 0.9 && l > 0.2
      })

      return filteredPalette.filter((val, i) => {
        let keep = true

        filteredPalette.forEach((val2, i2) => {
          // don't test same colors
          if (i === i2) {
            return
          }

          // if these two colors are at least 90% similar...
          if (colorMatch(val, val2, 85)) {
            // AND our main index is > this index...
            if (i > i2) {
              // ... we need to reject this color
              keep = false
            }
          }
        })

        return keep
      })
    }
  }, [ palette ])

  return (
    <section className='Swatches'>
      {commonAccents && commonAccents.length ? (
        <div className='Swatches__recommendations'>
          <h1 className='Swatches__recommendations__title'>Recommended SW Accent Colors</h1>
          {commonAccents.map((id, i) => {
            const col = colorMap[id]
            return col ? (
              <button className='Swatches__recommendations__swatch' key={i} style={{ background: col.hex }} onClick={setColor(col.hex)}>{col.name}</button>
            ) : null
          })}
        </div>
      ) : null}
      {processedPalette && processedPalette.length && accents.current
        ? (
          <div className='Swatches__recommendations'>
            <h1 className='Swatches__recommendations__title'>Primary Colors, SW Matches</h1>
            {processedPalette.map((col, i) => <Swatch key={i} color={col} reportAccents={reportAccents} />)}
          </div>
        )
        : <p>No suitable colors found.</p>
      }
    </section>
  )
}

export default Swatches
