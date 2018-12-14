// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import { paintAllSceneSurfaces } from '../../../../actions/scenes'

type Props = {
  color: Object,
  paintAllSceneSurfaces: Function
}

class SimilarColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.selectColor = this.selectColor.bind(this)
  }

  render () {
    const { color } = this.props

    return (
      <li onClick={this.selectColor} className={`${SimilarColorSwatch.baseClass}__similar-color`} style={{ backgroundColor: color.hex }}>
        <p className={`${SimilarColorSwatch.baseClass}__similar-color-name`}>
          {color.brandKey} {color.colorNumber} - {color.name}
        </p>
      </li>
    )
  }

  selectColor () {
    this.props.paintAllSceneSurfaces(this.props.color)
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    paintAllSceneSurfaces: (color) => {
      dispatch(paintAllSceneSurfaces(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(SimilarColorSwatch)
