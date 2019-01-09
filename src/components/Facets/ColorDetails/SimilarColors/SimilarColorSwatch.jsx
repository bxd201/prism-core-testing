// @flow
import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'

import { generateColorDetailsPageUrl } from '../../../../shared/helpers/ColorUtils'

type Props = {
  color: Object
}

class SimilarColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const { color } = this.props

    return (
      <li className={`${SimilarColorSwatch.baseClass}__similar-color`} style={{ backgroundColor: color.hex }}>
        <Link to={generateColorDetailsPageUrl(color)} className={`${SimilarColorSwatch.baseClass}__similar-color-info`} style={{ backgroundColor: color.hex }}>
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
