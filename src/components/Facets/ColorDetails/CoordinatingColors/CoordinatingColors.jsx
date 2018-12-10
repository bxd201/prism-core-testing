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

class CoordinatingColors extends PureComponent<Props> {
  static baseClass = 'color-info'

  render () {
    const coordinatingColors = this.coordinatingColors()

    return (
      <React.Fragment>
        <h5 className='visually-hidden'>Coordinating Colors</h5>
        <ul className={`${CoordinatingColors.baseClass}__coord-colors`}>
          <li className={`${CoordinatingColors.baseClass}__coord-color`} onClick={() => this.selectColor(coordinatingColors.coord1Color)} style={{ backgroundColor: coordinatingColors.coord1Color.hex }}>
            <p className={`${CoordinatingColors.baseClass}__coord-color-number`}>
              {`${coordinatingColors.coord1Color.brandKey} ${coordinatingColors.coord1Color.colorNumber}`}
            </p>
            <p className={`${CoordinatingColors.baseClass}__coord-color-name`}>{coordinatingColors.coord1Color.name}</p>
          </li>
          <li className={`${CoordinatingColors.baseClass}__coord-color`} onClick={() => this.selectColor(coordinatingColors.coord2Color)} style={{ backgroundColor: coordinatingColors.coord2Color.hex }}>
            <p className={`${CoordinatingColors.baseClass}__coord-color-number`}>
              {`${coordinatingColors.coord2Color.brandKey} ${coordinatingColors.coord2Color.colorNumber}`}
            </p>
            <p className={`${CoordinatingColors.baseClass}__coord-color-name`}>{coordinatingColors.coord2Color.name}</p>
          </li>
          <li className={`${CoordinatingColors.baseClass}__coord-color`} onClick={() => this.selectColor(coordinatingColors.whiteColor)} style={{ backgroundColor: coordinatingColors.whiteColor.hex }}>
            <p className={`${CoordinatingColors.baseClass}__coord-color-number`}>
              {`${coordinatingColors.whiteColor.brandKey} ${coordinatingColors.whiteColor.colorNumber}`}
            </p>
            <p className={`${CoordinatingColors.baseClass}__coord-color-name`}>{coordinatingColors.whiteColor.name}</p>
          </li>
        </ul>
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
