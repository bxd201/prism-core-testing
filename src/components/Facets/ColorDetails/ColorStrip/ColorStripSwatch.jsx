// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import type { Color } from '../../../../shared/types/Colors'

import { paintAllMainSurfaces } from '../../../../actions/scenes'

type Props = {
  color: Color,
  active: Boolean,
  activateColor: Function,
  paintAllMainSurfaces: Function
}

class ColorStripSwatch extends PureComponent<Props> {
  static baseClass = 'color-info'

  constructor (props) {
    super(props)

    this.selectColor = this.selectColor.bind(this)
  }

  render () {
    const { color, active } = this.props

    let BUTTON_CLASSES = [
      `${ColorStripSwatch.baseClass}__strip-color-info`
    ]
    if (active) {
      BUTTON_CLASSES.push(`${ColorStripSwatch.baseClass}__strip-color-info--active`)
    }

    return (
      <li className={`${ColorStripSwatch.baseClass}__strip-color`} style={{ backgroundColor: color.hex }} onClick={this.selectColor}>
        <button className={BUTTON_CLASSES.join(' ')}>
          <span className={`${ColorStripSwatch.baseClass}__strip-color-name ${color.isDark ? `${ColorStripSwatch.baseClass}__strip-color-name--dark-color` : ''}`} >{color.name}</span>
        </button>
      </li>
    )
  }

  selectColor = function selectColor () {
    this.props.activateColor(this.props.color)
    this.props.paintAllMainSurfaces(this.props.color)
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    paintAllMainSurfaces: (color) => {
      dispatch(paintAllMainSurfaces(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(ColorStripSwatch)
