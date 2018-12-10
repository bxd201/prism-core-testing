// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { filter, split } from 'lodash'

import { paintAllSceneSurfaces } from '../../../../actions/scenes'

type Props = {
  colors: Array,
  color: Object,
  paintAllSceneSurfaces: Function
}

class ColorStrip extends PureComponent<Props> {
  static baseClass = 'color-info'

  activeColor: Color

  constructor (props) {
    super(props)

    this.activeColor = props.color
  }

  render () {
    const stripColors = this.colorStripColors()

    return (
      <React.Fragment>
        <ul className={`${ColorStrip.baseClass}__strip`}>
          <li className={`${ColorStrip.baseClass}__strip-location`}><span className={`${ColorStrip.baseClass}__strip-location-name`}>{this.colorStripLocation()}</span></li>
          {stripColors.map(color => {
            return (
              <li key={color.id} className={`${ColorStrip.baseClass}__strip-color`} style={{ backgroundColor: color.hex }} onClick={() => this.selectColor(color)}>
                <span className={`${ColorStrip.baseClass}__strip-color-name`}>{color.name}</span>
                {/* <button onClick={() => this.selectColor(color)}>
                  {color.name}{(color.id === this.activeColor.id) ? ' - ACTIVE' : ''}
                </button> */}
              </li>
            )
          })}
        </ul>
      </React.Fragment>
    )
  }

  colorStripLocation () {
    const { color } = this.props
    const stripLocation = split(color.storeStripLocator, '-')[0]

    return stripLocation
  }

  colorStripColors () {
    const { colors } = this.props
    const stripLocation = this.colorStripLocation()

    // grab all colors with the locationId
    return filter(colors, c => split(c.storeStripLocator, '-')[0] === stripLocation)
  }

  selectColor (color) {
    // track the active color within the color strip
    this.activeColor = color

    // paint all the scenes & secen surfaces
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

export default connect(null, mapDispatchToProps)(ColorStrip)
