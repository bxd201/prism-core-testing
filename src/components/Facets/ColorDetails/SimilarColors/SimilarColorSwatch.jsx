// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import * as GA from 'src/analytics/GoogleAnalytics'

import type { Color } from '../../../../shared/types/Colors'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Color
}

function SimilarColorSwatch ({ color }: Props) {
  const BASE_CLASS = 'color-info'
  const handleClick = () => {
    GA.event({
      category: 'Color Detail / Similar Color',
      action: 'View Similar Color',
      label: color.name
    })
  }

  return (
    <li className={`${BASE_CLASS}__similar-color`} style={{ backgroundColor: color.hex }}>
      <Link to={generateColorDetailsPageUrl(color)} className={`${BASE_CLASS}__similar-color-info`} onClick={handleClick} style={{ backgroundColor: color.hex }}>
        <div className={`${BASE_CLASS}__similar-color-info-wrapper`}>
          <span className={`${BASE_CLASS}__similar-color-brand-key`} >{color.brandKey}</span> <span className={`${BASE_CLASS}__similar-color-number`} >{color.colorNumber}</span>
          <p className={`${BASE_CLASS}__similar-color-name`} >{color.name}</p>
        </div>
      </Link>
    </li>
  )
}

export default SimilarColorSwatch
