// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { filter, split } from 'lodash'

import { paintAllSceneSurfaces } from '../../../actions/scenes'

type Props = {
  colors: Array,
  color: Object,
  paintAllSceneSurfaces: Function
}

class ColorStrip extends PureComponent<Props> {
  activeColor: Color

  constructor (props) {
    super(props)

    this.activeColor = props.color
  }

  render () {
    const stripColors = this.colorStripColors()

    return (
      <React.Fragment>
        <strong>Color Strip</strong>
        <hr />
        <ul>
          {stripColors.map(color => {
            return (
              <li key={color.id}>
                <button onClick={() => this.selectColor(color)}>
                  {color.name}{(color.id === this.activeColor.id) ? ' - ACTIVE' : ''}
                </button>
              </li>
            )
          })}
        </ul>
        <hr />
      </React.Fragment>
    )
  }

  colorStripColors () {
    const { colors, color } = this.props
    const stripLocation = split(color.storeStripLocator, '-')[0]

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
