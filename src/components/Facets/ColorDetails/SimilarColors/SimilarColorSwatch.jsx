// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import * as GA from 'src/analytics/GoogleAnalytics'
import type { Color } from '../../../../shared/types/Colors.js.flow'
import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = { color: Color }
const SimilarColorSwatch = ({ color }: Props) => (
  <li className='color-info__similar-color'>
    <Link
      to={generateColorDetailsPageUrl(color)}
      className='color-info__similar-color-info'
      style={{ backgroundColor: color.hex }}
      onClick={() => GA.event({ category: 'Color Detail / Similar Color', action: 'View Similar Color', label: color.name })}
      aria-label={`${color.brandKey} ${color.colorNumber} ${color.name}`}
    />
  </li>
)

export default SimilarColorSwatch
