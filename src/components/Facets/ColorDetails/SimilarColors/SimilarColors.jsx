// @flow
import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'

import type { Color, ColorMap } from '../../../../shared/types/Colors'

import SimilarColorSwatch from './SimilarColorSwatch'

type Props = {
  colors: ColorMap,
  color: Color
}

class SimilarColors extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.state = { activeColorID: null }
    this.setActiveColor = this.setActiveColor.bind(this)
  }

  render () {
    const { colors, color } = this.props
    const similarColors = color.similarColors
    const { activeColorID } = this.state

    return (
      <React.Fragment>
        <h5 className='visually-hidden'><FormattedMessage id='SIMILAR_COLORS' /></h5>
        <ul className={`${SimilarColors.baseClass}__similar-colors`}>
          {similarColors.map((colorId: string) => {
            const color = colors[colorId]

            if (color) {
              return <SimilarColorSwatch activeColorID={activeColorID} setActiveColor={this.setActiveColor} key={colorId} color={color} />
            }
          }).filter(color => !!color)}
        </ul>
        <hr />
      </React.Fragment>
    )
  }

  setActiveColor (selectedColorID) {
    this.setState({ activeColorID: selectedColorID })
  }
}

export default SimilarColors
