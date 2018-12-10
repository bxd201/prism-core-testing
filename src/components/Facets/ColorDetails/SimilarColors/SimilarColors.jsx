// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { find } from 'lodash'

import { paintAllSceneSurfaces } from '../../../../actions/scenes'

type Props = {
  colors: Array,
  color: Object,
  paintAllSceneSurfaces: Function
}

class SimilarColors extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const similarColors = this.similarColors()

    return (
      <React.Fragment>
        <h5 className='visually-hidden'>Similar Colors</h5>
        <ul className={`${SimilarColors.baseClass}__similar-colors`}>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
          <li className={`${SimilarColors.baseClass}__similar-color`}>
            <p className={`${SimilarColors.baseClass}__similar-color-name`}>SW 2307 - Positive Red</p>
          </li>
        </ul>
        <hr />
        <ul>
          {similarColors.map(color => {
            return (
              <li key={color.id}><button onClick={() => this.selectColor(color)}>{color.name}</button></li>
            )
          })}
        </ul>
        <hr />
      </React.Fragment>
    )
  }

  similarColors () {
    const { colors, color } = this.props
    const similarColorIds = color.similarColors || []

    const similarColors = similarColorIds.map(similarColorId => find(colors, color => color.id === similarColorId))

    return similarColors
  }

  selectColor (color) {
    this.props.paintAllSceneSurfaces(color)
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    paintAllSceneSurfaces: (color) => {
      dispatch(paintAllSceneSurfaces(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(SimilarColors)
