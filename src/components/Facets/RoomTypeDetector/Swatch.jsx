// @flow
import React, { useMemo, useEffect, useCallback, useContext } from 'react'
import { useSelector } from 'react-redux'
import sortBy from 'lodash/sortBy'
import flatten from 'lodash/flatten'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import { ColorCollector } from './RoomTypeDetector'

import { getColorDistance } from 'src/components/PaintScene/utils'
import { type Color } from 'src/shared/types/Colors.js.flow'

import './Swatch.scss'

const SW_COLOR_MATCH_THRESHHOLD = 8 // 0 = perfect match, 100 = worst possible match

type SwatchProps = {
  color: TinyColor,
  reportAccents: Function
}

const Swatch = ColorDataWrapper((props: SwatchProps) => {
  const {
    color,
    reportAccents
  } = props

  const { update } = useContext(ColorCollector)
  const { colorMap } = useSelector(state => state.colors.items)
  const hex = useMemo(() => color && color.toHexString(), [ color ])

  const colorMatches = useMemo(() => {
    if (colorMap && color) {
      const keys = Object.keys(colorMap)
      const swColorArr = keys.map(key => colorMap[key])

      const thisRgb = color.toRgb()
      const thisMatches = sortBy(
        swColorArr
          .map((swCol) => {
            const { red: r, green: g, blue: b } = swCol
            return {
              _dist: getColorDistance({ r: r, g: g, b: b }, thisRgb),
              color: swCol
            }
          })
          .filter(({ _dist }) => _dist <= SW_COLOR_MATCH_THRESHHOLD)
          .map(({ color }) => color),
        '_dist'
      ).slice(0, 3)

      return thisMatches
    }
  }, [ colorMap, color ])

  useEffect(() => {
    if (colorMatches) {
      const accents = flatten(colorMatches.map((col: Color) => {
        const { coordinatingColors: cc = {} } = col
        const ids = Object.keys(cc).map(key => cc[key])
        return ids
      })).sort()

      reportAccents(accents)
    }
  }, [ colorMatches ])

  const onSwatchClick = useCallback(() => {
    update(color)
  }, [ color ])

  return (
    <div className='Swatch' style={{ background: hex }} onClick={onSwatchClick} role='button' tabIndex={-1}>
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
})

export default Swatch
