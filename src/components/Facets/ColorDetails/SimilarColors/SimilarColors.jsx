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
          {similarColors.map(color => {
            return (
              <li key={color.id} onClick={() => this.selectColor(color)} className={`${SimilarColors.baseClass}__similar-color`} style={{ backgroundColor: color.hex }}>
                <p className={`${SimilarColors.baseClass}__similar-color-name`}>
                  {color.brandKey} {color.colorNumber} - {color.name}
                </p>
              </li>
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

    // return empty array if no similar colors exist
    if (!similarColorIds.length) {
      return similarColorIds
    }

    const similarColors = similarColorIds.map(similarColorId => {
      return find(colors, color => color.id === similarColorId)
    })

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
