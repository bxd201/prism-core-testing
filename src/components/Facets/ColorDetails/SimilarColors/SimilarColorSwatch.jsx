// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import { paintAllSceneSurfaces } from '../../../../actions/scenes'

type Props = {
  color: Object,
  paintAllSceneSurfaces: Function,
  setActiveColor: Function,
  activeColorID: Number
}

class SimilarColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.selectColor = this.selectColor.bind(this)
  }

  render () {
    const { color, activeColorID } = this.props

    return (
      <li onClick={this.selectColor} className={`${SimilarColorSwatch.baseClass}__similar-color`} style={{ backgroundColor: color.hex }}>
        <button className={`${SimilarColorSwatch.baseClass}__similar-color-info ${activeColorID && color.id === activeColorID ? ` ${SimilarColorSwatch.baseClass}__similar-color-info--active` : ''}`} style={{ backgroundColor: color.hex }}>
          <div className={`${SimilarColorSwatch.baseClass}__similar-color-info-wrapper`}>
            <span className={`${SimilarColorSwatch.baseClass}__similar-color-brand-key`} >{color.brandKey}</span> <span className={`${SimilarColorSwatch.baseClass}__similar-color-number`} >{color.colorNumber}</span>
            <p className={`${SimilarColorSwatch.baseClass}__similar-color-name`} >{color.name}</p>
          </div>
        </button>
      </li>
    )
  }

  selectColor = function selectColor () {
    this.props.paintAllSceneSurfaces(this.props.color)
    this.props.setActiveColor(this.props.color.id)
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
