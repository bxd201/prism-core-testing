// @flow
import React, { PureComponent } from 'react'
import { has } from 'lodash'
import { FormattedMessage } from 'react-intl'

import SimilarColorSwatch from './SimilarColorSwatch'

type Props = {
  colors: Array,
  color: Object
}

class SimilarColors extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const similarColors = this.similarColors()

    return (
      <React.Fragment>
        <h5 className='visually-hidden'><FormattedMessage id='SIMILAR_COLORS' /></h5>
        <ul className={`${SimilarColors.baseClass}__similar-colors`}>
          {similarColors.map(color => <SimilarColorSwatch key={color.id} color={color} />)}
        </ul>
        <hr />
      </React.Fragment>
    )
  }

  similarColors () {
    const { colors, color } = this.props
    const similarColorIds = color.similarColors || []
    const similarColors = []

    // return empty array if no similar colors exist
    if (!similarColorIds.length) {
      return similarColorIds
    }

    similarColorIds.map(similarColorId => {
      if (has(colors, similarColorId)) {
        similarColors.push(colors[similarColorId])
      }
    })

    return similarColors
  }
}

export default SimilarColors
