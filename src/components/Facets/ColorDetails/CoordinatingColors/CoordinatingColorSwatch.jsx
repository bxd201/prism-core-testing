// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import * as GA from 'src/analytics/GoogleAnalytics'

import type { Color } from '../../../../shared/types/Colors.js.flow'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Color
}

function CoordinatingColorSwatch ({ color }: Props) {
  // since not all colors have coordinating colors
  if (!color) {
    return null
  }
  const BASE_CLASS = 'color-info'
  const handleClick = () => {
    GA.event({
      category: 'Color Detail / Coordinating Color',
      action: 'View Coord Color',
      label: color.name
    })
  }
  return (
    <li className={`${BASE_CLASS}__coord-color ${color.isDark ? `${BASE_CLASS}__coord-color--dark-color` : ''}`}
      style={{ backgroundColor: color.hex }}>
      <Link to={generateColorDetailsPageUrl(color)} onClick={handleClick} className={`${BASE_CLASS}__color-swatch-link`}>
        <p className={`${BASE_CLASS}__coord-color-number`}>
          {`${color.brandKey} ${color.colorNumber}`}
        </p>
        <p className={`${BASE_CLASS}__coord-color-name`}>{color.name}</p>
      </Link>
    </li>
  )
}

export default CoordinatingColorSwatch
