// @flow
import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Color, ColorMap } from '../../../../shared/types/Colors'

import SimilarColorSwatch from './SimilarColorSwatch'

type Props = {
  colors: ColorMap,
  color: Color
}

type State = {
  activeColorID: number | void
}

class SimilarColors extends PureComponent<Props, State> {
  static baseClass = 'color-info'

  constructor (props: Props) {
    super(props)

    this.state = { activeColorID: void (0) }
  }

  render () {
    const { colors, color } = this.props
    const similarColors = color.similarColors

    return (
      <React.Fragment>
        <h5 className='visually-hidden'><FormattedMessage id='SIMILAR_COLORS' /></h5>
        <ul className={`${SimilarColors.baseClass}__similar-colors`}>
          {similarColors.map((colorId: string) => {
            const color = colors[colorId]
            if (color) {
              return <SimilarColorSwatch key={colorId} color={color} />
            }
          }).filter(color => !!color)}
        </ul>
        <hr />
      </React.Fragment>
    )
  }
}

export default SimilarColors
