// @flow
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import type { Color, ColorMap } from 'src/shared/types/Colors.js.flow'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'
import 'src/scss/convenience/visually-hidden.scss'

const orderedCoordColorProps = [
  'coord1ColorId',
  'coord2ColorId',
  'whiteColorId'
]

type Props = { color: Color, onColorChanged: Color => void }
function CoordinatingColors ({ color, onColorChanged }: Props) {
  const { brandId }: ConfigurationContextType = useContext(ConfigurationContext)
  const colorMap: ColorMap = useSelector(store => store.colors.items.colorMap)
  const { coordinatingColors } = color

  return (
    <>
      <h5 className='visually-hidden'><FormattedMessage id='COORDINATING_COLORS' /></h5>
      <ul className={`color-info__coord-colors`}>
        {orderedCoordColorProps.map(prop => coordinatingColors && coordinatingColors[prop]).filter(Boolean).map(id => colorMap[id]).filter(Boolean).map((color: Color) => {
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
                  GA.event({ category: 'Color Detail / Coordinating Color', action: 'View Coord Color', label: color.name }, GA_TRACKER_NAME_BRAND[brandId])
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
