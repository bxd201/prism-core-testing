// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import ReactGA from 'react-ga'
import type { Color } from '../../../../shared/types/Colors'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Color
}

class CoordinatingColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    ReactGA.event({
      category: 'Color Detail / Coordinating Color',
      action: 'View Coord Color',
      label: this.props.color.name
    })
  }

  render () {
    const { color } = this.props

    // not all colors have all coordinating colors
    if (!color) {
      return null
    }

    return (
      <li className={`${CoordinatingColorSwatch.baseClass}__coord-color ${color.isDark ? `${CoordinatingColorSwatch.baseClass}__coord-color--dark-color` : ''}`}
        style={{ backgroundColor: color.hex }}>
        <Link to={generateColorDetailsPageUrl(color)} onClick={this.handleClick} className={`${CoordinatingColorSwatch.baseClass}__color-swatch-link`}>
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
