// @flow
import React from 'react'
import { FormattedMessage } from 'react-intl'
import find from 'lodash/find'

import type { Color, ColorMap } from '../../../../shared/types/Colors'

import CoordinatingColorSwatch from './CoordinatingColorSwatch'

import 'src/scss/convenience/visually-hidden.scss'

type Props = {
  colors: ColorMap,
  color: Color
}

function CoordinatingColors ({ colors, color }: Props) {
  const coord1ColorId = color.coordinatingColors.coord1ColorId
  const coord2ColorId = color.coordinatingColors.coord2ColorId
  const whiteColorId = color.coordinatingColors.whiteColorId

  const coord1Color = find(colors, color => color.id === coord1ColorId)
  const coord2Color = find(colors, color => color.id === coord2ColorId)
  const whiteColor = find(colors, color => color.id === whiteColorId)

  return (
    <React.Fragment>
      <h5 className='visually-hidden'><FormattedMessage id='COORDINATING_COLORS' /></h5>
      <ul className={`color-info__coord-colors`}>
        <CoordinatingColorSwatch color={coord1Color} />
        <CoordinatingColorSwatch color={coord2Color} />
        <CoordinatingColorSwatch color={whiteColor} />
      </ul>
    </React.Fragment>
  )
}

export default CoordinatingColors
