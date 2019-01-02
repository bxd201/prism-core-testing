// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'

import { paintAllSceneSurfaces } from '../../../../actions/scenes'

type Props = {
  color: Object,
  paintAllSceneSurfaces: Function
}

class CoordinatingColorSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.selectColor = this.selectColor.bind(this)
  }

  render () {
    const { color } = this.props

    // not all colors have all coordinating colors
    if (!color) {
      return null
    }

    return (
      <li className={`${CoordinatingColorSwatch.baseClass}__coord-color`} onClick={this.selectColor} style={{ backgroundColor: color.hex }}>
        <p className={`${CoordinatingColorSwatch.baseClass}__coord-color-number`}>
          {`${color.brandKey} ${color.colorNumber}`}
        </p>
        <p className={`${CoordinatingColorSwatch.baseClass}__coord-color-name`}>{color.name}</p>
      </li>
    )
  }

  selectColor = function selectColor () {
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

export default connect(null, mapDispatchToProps)(CoordinatingColorSwatch)
