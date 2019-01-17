// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import ReactGA from 'react-ga'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Object
}

class SimilarColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    ReactGA.event({
      category: 'Color Detail / Similar Color',
      action: 'View Similar Color',
      label: this.props.color.name
    })
  }

  render () {
    const { color } = this.props

    return (
      <li className={`${SimilarColorSwatch.baseClass}__similar-color`} style={{ backgroundColor: color.hex }}>
        <Link to={generateColorDetailsPageUrl(color)} className={`${SimilarColorSwatch.baseClass}__similar-color-info`} onClick={this.handleClick} style={{ backgroundColor: color.hex }}>
          <div className={`${SimilarColorSwatch.baseClass}__similar-color-info-wrapper`}>
            <span className={`${SimilarColorSwatch.baseClass}__similar-color-brand-key`} >{color.brandKey}</span> <span className={`${SimilarColorSwatch.baseClass}__similar-color-number`} >{color.colorNumber}</span>
            <p className={`${SimilarColorSwatch.baseClass}__similar-color-name`} >{color.name}</p>
          </div>
        </Link>
      </li>
    )
  }
}

export default SimilarColorSwatch
