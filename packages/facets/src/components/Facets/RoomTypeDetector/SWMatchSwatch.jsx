// @flow
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import ColorDataWrapper from 'src/helpers/ColorDataWrapper/ColorDataWrapper'
import tinycolor from '@ctrl/tinycolor'
import { type Color } from 'src/shared/types/Colors.js.flow'

import './SWMatchSwatch.scss'

type SWMatchSwatchProps = {
  color: tinycolor,
  swPalette: Color[] | typeof undefined
}

const SWMatchSwatch = (props: SWMatchSwatchProps) => {
  const {
    color,
    swPalette: colorMatches
  } = props

  const { formatMessage } = useIntl()
  const { colorMap } = useSelector(state => state.colors.items)
  const hex = useMemo(() => color && color.toHexString(), [color])

  return (
    <div className='SWMatchSwatch' style={{ background: hex }}>
      <div className='SWMatchSwatch__coordinating'>
        <>
          {colorMatches
            ? colorMatches.map((color, i) => {
              const { hex, name, coordinatingColors = {} } = color

              return (
              <ul key={i} className='SWMatchSwatch__coordinating__set'>
                <li className='SWMatchSwatch__coordinating__set__color SWMatchSwatch__coordinating__set__color--primary' style={{ background: hex }} title={name} />
                <>
                  {Object.keys(coordinatingColors).map((key, i) => {
                    const colorId = coordinatingColors[key]
                    const { hex, name } = colorMap[colorId]

                    return (
                      <li key={i} className='SWMatchSwatch__coordinating__set__color' style={{ background: hex }} title={name} />
                    )
                  })}
                </>
              </ul>
              )
            })
            : `${formatMessage({ id: 'PROCESSING' })}...`}
        </>
      </div>
    </div>
  )
}

export default ColorDataWrapper(SWMatchSwatch)
