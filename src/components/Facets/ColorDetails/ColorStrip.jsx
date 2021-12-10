// @flow
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import filter from 'lodash/filter'
import split from 'lodash/split'
import type { Color, ColorMap } from 'src/shared/types/Colors.js.flow'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'
import * as GA from 'src/analytics/GoogleAnalytics'
import { GA_TRACKER_NAME_BRAND } from 'src/constants/globals'

type Props = { color: Color, onColorChanged: Color => void }
export function ColorStrip ({ color, onColorChanged }: Props) {
  const { brandId }: ConfigurationContextType = useContext(ConfigurationContext)
  const stripLocation = split(color.storeStripLocator, '-')[0]
  const colorMap: ColorMap = useSelector(store => store.colors.items.colorMap)

  // TODO: Perhaps we need to find a better resolution to the data so we aren't having to do this bright test in multiple places
  const stripColors = stripLocation ? filter(colorMap, c => (!c.ignore && split(c.storeStripLocator, '-')[0] === stripLocation)) : []

  return (stripColors.length > 0 &&
    <ul className={`color-info__strip`}>
      <li className={`color-info__strip-location`}>
        <span className={`color-info__strip-location-name`}>{stripLocation}</span>
      </li>
      {stripColors.map((stripColor, i) => {
        const active = color.id === stripColor.id
        return (
          <li key={i} className='color-info__strip-color' style={{ backgroundColor: stripColor.hex }}>
            <button
              className={`color-info__strip-color-info${active ? ` color-info__strip-color-info--active` : ''}`}
              onClick={() => {
                onColorChanged(stripColor)
                GA.event({ category: 'Color Detail / Swatch Chip List', action: 'View Swatch Chip Color', label: stripColor.name }, GA_TRACKER_NAME_BRAND[brandId])
              }}
            >
              <span className={`color-info__strip-color-name${stripColor.isDark ? ` color-info__strip-color-name--dark-color` : ''}${!active ? ' visually-hidden' : ''}`}>
                {stripColor.name}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default ColorStrip
