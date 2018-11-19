// @flow
import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import { flatten, sortBy } from 'lodash'

import ColorWallSwatchList from './ColorWallSwatchList'

const DISPLAY_ORDER_DEFAULT = 'default'
const DISPLAY_ORDER_LIGHTNESS = 'lightness'
const DISPLAY_ORDER_BRIGHTNESS = 'brightness'
const DISPLAY_ORDER_SATURATION = 'saturation'
const DISPLAY_ORDER_COLOR = 'color'

type Props = {
  colors: Array,
  match: Object,
  family: string,
  displayOrder: string
}

class StandardColorWall extends PureComponent<Props> {
  previewColor = void (0)
  cwRef = void (0)
  allColors = void (0)

  static defaultProps = {
    displayOrder: DISPLAY_ORDER_DEFAULT
  }

  colorFamily (family) {
    return this.props.colors[family]
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
        <div ref={this.cwRef}>
          <ColorWallSwatchList key={'all'} colors={ColorWallColors} active={params.colorNumber} />
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(StandardColorWall)
