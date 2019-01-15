// @flow
import React, { PureComponent } from 'react'
import type { Color } from '../../../../shared/types/Colors'

type Props = {
  color: Color,
  active: Boolean,
  activateColor: Function,
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
      <li className={`${ColorStripSwatch.baseClass}__strip-color`} style={{ backgroundColor: color.hex }}>
        <button className={BUTTON_CLASSES.join(' ')} onClick={this.selectColor}>
          <span className={`${ColorStripSwatch.baseClass}__strip-color-name ${color.isDark ? `${ColorStripSwatch.baseClass}__strip-color-name--dark-color` : ''}`} >{color.name}</span>
        </button>
      </li>
    )
  }

  selectColor = function selectColor () {
    this.props.activateColor(this.props.color)
  }
}

export default ColorStripSwatch
