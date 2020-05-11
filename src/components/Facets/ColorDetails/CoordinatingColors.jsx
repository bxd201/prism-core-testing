// @flow
import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import filter from 'lodash/filter'
import values from 'lodash/values'
import type { Color, ColorMap } from 'src/shared/types/Colors.js.flow'
import * as GA from 'src/analytics/GoogleAnalytics'
import 'src/scss/convenience/visually-hidden.scss'

type Props = { color: Color, onColorChanged: Color => void }
function CoordinatingColors ({ color, onColorChanged }: Props) {
  const colorMap: ColorMap = useSelector(store => store.colors.items.colorMap)

  return (
    <>
      <h5 className='visually-hidden'><FormattedMessage id='COORDINATING_COLORS' /></h5>
      <ul className={`color-info__coord-colors`}>
        {filter(colorMap, c => values(color.coordinatingColors).some(id => id === c.id)).map((color: Color) => {
          return (
            <li
              key={color.colorNumber}
              className={`color-info__coord-color ${color.isDark ? `color-info__coord-color--dark-color` : ''}`}
              style={{ backgroundColor: color.hex }}
            >
              <button
                className='color-info__color-swatch-link'
                onClick={() => {
                  onColorChanged(color)
                  GA.event({ category: 'Color Detail / Coordinating Color', action: 'View Coord Color', label: color.name })
                }}
              >
                <p className='color-info__coord-color-number'>
                  {`${color.brandKey} ${color.colorNumber}`}
                </p>
                <p className='color-info__coord-color-name'>
                  {color.name}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default CoordinatingColors
