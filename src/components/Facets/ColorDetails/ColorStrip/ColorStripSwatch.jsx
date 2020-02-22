// @flow
import React from 'react'
import * as GA from 'src/analytics/GoogleAnalytics'
import { withRouter, type RouterHistory } from 'react-router-dom'

import type { Color } from '../../../../shared/types/Colors.js.flow'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  color: Color,
  active: boolean,
  history: RouterHistory,
}

export function ColorStripSwatch ({ color, active, history }: Props) {
  const selectColor = () => {
    GA.event({
      category: 'Color Detail / Swatch Chip List',
      action: 'View Swatch Chip Color',
      label: color.name
    })
    history.push(generateColorDetailsPageUrl(color))
  }

  const BASE_CLASS = 'color-info'

  let BUTTON_CLASSES = [
    `${BASE_CLASS}__strip-color-info`,
    (active ? `${BASE_CLASS}__strip-color-info--active` : '')
  ].join(' ')

  const TEXT_CLASSES = [
    `${BASE_CLASS}__strip-color-name`,
    (color.isDark ? `${BASE_CLASS}__strip-color-name--dark-color` : ''),
    (!active ? 'visually-hidden' : '')
  ].join(' ')

  return (
    <li className={`${BASE_CLASS}__strip-color`} style={{ backgroundColor: color.hex }}>
      <button className={BUTTON_CLASSES} onClick={selectColor}>
        <span className={TEXT_CLASSES} >{color.name}</span>
      </button>
    </li>
  )
}

export default withRouter(ColorStripSwatch)
