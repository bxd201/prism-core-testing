// @flow
import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import { find } from 'lodash'

import CoordinatingColorSwatch from './CoordinatingColorSwatch'
import type { Color, ColorMap } from '../../../../shared/types/Colors'

type Props = {
  colors: ColorMap,
  color: Color,
}

class CoordinatingColors extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const coordinatingColors = this.coordinatingColors()
    const { coord1Color, coord2Color, whiteColor } = coordinatingColors

    return (
      <React.Fragment>
        <h5 className='visually-hidden'><FormattedMessage id='COORDINATING_COLORS' /></h5>
        <ul className={`${CoordinatingColors.baseClass}__coord-colors`}>
          <CoordinatingColorSwatch color={coord1Color} />
          <CoordinatingColorSwatch color={coord2Color} />
          <CoordinatingColorSwatch color={whiteColor} />
        </ul>
      </React.Fragment>
    )
  }

  coordinatingColors () {
    const { colors, color } = this.props

    const coord1ColorId = color.coordinatingColors.coord1ColorId
    const coord2ColorId = color.coordinatingColors.coord2ColorId
    const whiteColorId = color.coordinatingColors.whiteColorId

    const coord1Color = find(colors, color => color.id === coord1ColorId)
    const coord2Color = find(colors, color => color.id === coord2ColorId)
    const whiteColor = find(colors, color => color.id === whiteColorId)

    const coordinatingColors = {
      coord1Color,
      coord2Color,
      whiteColor
    }

    return coordinatingColors
  }
}

export default CoordinatingColors
