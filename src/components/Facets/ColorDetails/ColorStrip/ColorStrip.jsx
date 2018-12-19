// @flow
import React, { PureComponent } from 'react'
import { filter, split } from 'lodash'

import ColorStripSwatch from './ColorStripSwatch'

type Props = {
  colors: Array,
  color: Object
}

class ColorStrip extends PureComponent<Props> {
  static baseClass = 'color-info'

  state: State = {
    activeColor: void (0)
  }

  constructor (props) {
    super(props)

    this.state = { activeColor: props.color }

    this.activateColor = this.activateColor.bind(this)
  }

  render () {
    const stripColors = this.colorStripColors()

    if (!stripColors) {
      return null
    }

    return (
      <React.Fragment>
        <ul className={`${ColorStrip.baseClass}__strip`}>
          <li className={`${ColorStrip.baseClass}__strip-location`}>
            <span className={`${ColorStrip.baseClass}__strip-location-name`}>{this.colorStripLocation()}</span>
          </li>
          {stripColors.map(color => {
            return <ColorStripSwatch key={color.id} color={color} activateColor={this.activateColor} active={(this.state.activeColor.id === color.id)} />
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

    if (!stripLocation) {
      return null
    }

    // grab all colors with the locationId
    return filter(colors, c => split(c.storeStripLocator, '-')[0] === stripLocation)
  }

  activateColor (color) {
    this.setState({ activeColor: color })
  }
}

export default ColorStrip
