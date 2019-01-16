// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import type { Color } from '../../../../shared/types/Colors'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Color
}

class CoordinatingColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const { color } = this.props

    // not all colors have all coordinating colors
    if (!color) {
      return null
    }

    return (
      <li className={`${CoordinatingColorSwatch.baseClass}__coord-color ${color.isDark ? `${CoordinatingColorSwatch.baseClass}__coord-color--dark-color` : ''}`}
        style={{ backgroundColor: color.hex }}>
        <Link to={generateColorDetailsPageUrl(color)} className={`${CoordinatingColorSwatch.baseClass}__color-swatch-link`}>
          <p className={`${CoordinatingColorSwatch.baseClass}__coord-color-number`}>
            {`${color.brandKey} ${color.colorNumber}`}
          </p>
          <p className={`${CoordinatingColorSwatch.baseClass}__coord-color-name`}>{color.name}</p>
        </Link>
      </li>
    )
  }
}

export default CoordinatingColorSwatch
