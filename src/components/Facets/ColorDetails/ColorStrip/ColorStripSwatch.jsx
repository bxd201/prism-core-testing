// @flow
import React from 'react'
import ReactGA from 'react-ga'
import { withRouter, type RouterHistory } from 'react-router-dom'

import type { Color } from '../../../../shared/types/Colors'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Color,
  active: boolean,
  history: RouterHistory,
}

function ColorStripSwatch ({ color, active, history }: Props) {
  const selectColor = () => {
    ReactGA.event({
      category: 'Color Detail / Swatch Chip List',
      action: 'View Swatch Chip Color',
      label: color.name
    }, ['GAtrackerPRISM'])
    history.push(generateColorDetailsPageUrl(color))
  }

  const BASE_CLASS = 'color-info'

  let BUTTON_CLASSES = [
    `${BASE_CLASS}__strip-color-info`
  ]
  if (active) {
    BUTTON_CLASSES.push(`${BASE_CLASS}__strip-color-info--active`)
  }

  return (
    <li className={`${BASE_CLASS}__strip-color`} style={{ backgroundColor: color.hex }}>
      <button className={BUTTON_CLASSES.join(' ')} onClick={selectColor}>
        <span className={`${BASE_CLASS}__strip-color-name ${color.isDark ? `${BASE_CLASS}__strip-color-name--dark-color` : ''}`} >{color.name}</span>
      </button>
    </li>
  )
}

export default withRouter(ColorStripSwatch)
