// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { find } from 'lodash'

import { paintAllSceneSurfaces } from '../../../actions/scenes'

type Props = {
  colors: Array,
  color: Object,
  paintAllSceneSurfaces: Function
}

class CoordinatingColors extends PureComponent<Props> {
  render () {
    const coordinatingColors = this.coordinatingColors()

    return (
      <React.Fragment>
        <strong>Coordinating Colors</strong>
        <hr />
        <ul>
          <li><button onClick={() => this.selectColor(coordinatingColors.coord1Color)}>{coordinatingColors.coord1Color.name}</button></li>
          <li><button onClick={() => this.selectColor(coordinatingColors.coord2Color)}>{coordinatingColors.coord2Color.name}</button></li>
          <li><button onClick={() => this.selectColor(coordinatingColors.whiteColor)}>{coordinatingColors.whiteColor.name}</button></li>
        </ul>
        <hr />
      </React.Fragment>
    )
  }

  coordinatingColors () {
    const { colors, color } = this.props
    const coord1ColorId = color.coordinatingColors.coord1ColorId
    const coord2ColorId = color.coordinatingColors.coord2ColorId
    const whiteColorId = color.coordinatingColors.whiteColorId

    const coord1Color = find(colors, color => color.id == coord1ColorId) // eslint-disable-line
    const coord2Color = find(colors, color => color.id == coord2ColorId) // eslint-disable-line
    const whiteColor = find(colors, color => color.id == whiteColorId) // eslint-disable-line

    const coordinatingColors = {
      coord1Color,
      coord2Color,
      whiteColor
    }

    return coordinatingColors
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

export default connect(null, mapDispatchToProps)(CoordinatingColors)
