/* eslint-disable */
// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'

import ColorWallSwatchList from './ColorWallSwatchList'

import { type Color } from '../../../shared/types/Colors'

const DISPLAY_ORDER_DEFAULT = 'default'
const DISPLAY_ORDER_LIGHTNESS = 'lightness'
const DISPLAY_ORDER_BRIGHTNESS = 'brightness'
const DISPLAY_ORDER_SATURATION = 'saturation'
const DISPLAY_ORDER_COLOR = 'color'

type Props = {
  colors: Object,
  match: Object,
  family: string,
  displayOrder: string
}

class StandardColorWall extends PureComponent<Props> {
  previewColor = void (0)
  allColors = void (0)

  static defaultProps = {
    displayOrder: DISPLAY_ORDER_DEFAULT
  }

  colorFamily (family) {
    return this.props.colors[family]
  }

  handleActivateColor = function handleActivateColor (color: Color) {
    this.setState({
      activeColor: color
    })
  }

  get colorFamilies () {
    return this.allColors || (this.allColors = flatten(Object.keys(this.props.colors).map(family => {
      return this.colorFamily(family)
    })))
  }

  render () {
    const { match: { params }, family, displayOrder, colors } = this.props // eslint-disable-line

    // get either a specific color family or all families
    // let ColorWallColors = (family === 'All') ? this.colorFamilies : this.colorFamily(family)
    let ColorWallColors = colors

    // sort colors based on displayOrder prop if provided
    switch (displayOrder) {
      case DISPLAY_ORDER_LIGHTNESS:
        // $FlowIgnore
        ColorWallColors = sortBy(ColorWallColors, 'lightness', 'hue', 'saturation')
        break
      case DISPLAY_ORDER_COLOR:
        // $FlowIgnore
        ColorWallColors = sortBy(ColorWallColors, 'hue', 'lightness', 'saturation')
        break
      case DISPLAY_ORDER_SATURATION:
        // $FlowIgnore
        ColorWallColors = sortBy(ColorWallColors, 'saturation', 'hue', 'lightness')
        break
      case DISPLAY_ORDER_BRIGHTNESS:
        // $FlowIgnore
        ColorWallColors = sortBy(ColorWallColors, color => (color.saturation * color.lightness), 'hue')
        break
      case DISPLAY_ORDER_DEFAULT:
      default:
    }

    return (
      <React.Fragment>
        <h1>standard</h1>
        <div className='color-wall-wall'>
          {/* {activeColor ? (
            <ColorWallSwatchList
              bloomRadius={2}
              onAddColor={addToLivePalette}
              cellSize={50}
              key={family}
              colors={ColorWallColors}
              initialActiveColor={activeColor} />
          ) : (
            <ColorWallSwatchList
              showAll
              immediateSelectionOnActivation
              cellSize={50}
              key={`${family}-showAll`}
              colors={ColorWallColors}
              active={params.colorNumber}
              onActivateColor={this.handleActivateColor} />
          )} */}
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(StandardColorWall)
