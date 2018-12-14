// @flow
import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import { find } from 'lodash'

import CoordinatingColorSwatch from './CoordinatingColorSwatch'

type Props = {
  colors: Array,
  color: Object,
}

class CoordinatingColors extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const coordinatingColors = this.coordinatingColors()

    return (
      <React.Fragment>
        <h5 className='visually-hidden'><FormattedMessage id='COORDINATING_COLORS' /></h5>
        <ul className={`${CoordinatingColors.baseClass}__coord-colors`}>
          <CoordinatingColorSwatch color={coordinatingColors.coord1Color} />
          <CoordinatingColorSwatch color={coordinatingColors.coord2Color} />
          <CoordinatingColorSwatch color={coordinatingColors.whiteColor} />
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
