// @flow
import React from 'react'
import filter from 'lodash/filter'
import split from 'lodash/split'
import type { Color, ColorMap } from '../../../../shared/types/Colors.js.flow'
import { withRouter, type RouterHistory } from 'react-router-dom'

import ColorStripSwatch from './ColorStripSwatch'

type RouterProps = {
  history: RouterHistory
}

type Props = RouterProps & {
  colors: ColorMap,
  color: Color
}

export function ColorStrip ({ colors, color, history }: Props) {
  const BASE_CLASS = 'color-info'
  const stripLocation = split(color.storeStripLocator, '-')[0]

  // attempt to populate the color strip
  let stripColors = []
  if (stripLocation) {
    // TODO: Perhaps we need to find a better resolution to the data so we aren't having to do this bright test in multiple places
    stripColors = filter(colors, c => (!c.ignore && split(c.storeStripLocator, '-')[0] === stripLocation))
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

export default withRouter(ColorStrip)
