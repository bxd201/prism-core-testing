// @flow
import React from 'react'
import { filter, split } from 'lodash'
import type { Color, ColorMap } from '../../../../shared/types/Colors'

import ColorStripSwatch from './ColorStripSwatch'

type Props = {
  colors: ColorMap,
  color: Color,
  history: RouterHistory
}

function ColorStrip ({ colors, color, history }: Props) {
  const BASE_CLASS = 'color-info'
  const stripLocation = split(color.storeStripLocator, '-')[0]

  // attempt to populate the color strip
  let stripColors = []
  if (stripLocation) {
    stripColors = filter(colors, c => split(c.storeStripLocator, '-')[0] === stripLocation)
  }

  // don't display the strip if there are no color strip colors
  if (stripColors.length === 0) {
    return null
  }

  return (
    <ul className={`${BASE_CLASS}__strip`}>
      <li className={`${BASE_CLASS}__strip-location`}>
        <span className={`${BASE_CLASS}__strip-location-name`}>{stripLocation}</span>
      </li>
      {stripColors.map(stripColor => (
        <ColorStripSwatch key={stripColor.id} color={stripColor} active={(color.id === stripColor.id)} />
      ))}
    </ul>
  )
}

export default ColorStrip
