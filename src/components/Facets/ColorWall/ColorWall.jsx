// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import { filterByFamily } from '../../../actions/loadColors'

import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

import ColorWallSwatchList from './ColorWallSwatchList'
import ColorWallButton from './ColorWallButton'

import './ColorWall.scss'

const DISPLAY_ORDER_DEFAULT = 'default'
const DISPLAY_ORDER_LIGHTNESS = 'lightness'
const DISPLAY_ORDER_BRIGHTNESS = 'brightness'
const DISPLAY_ORDER_SATURATION = 'saturation'
const DISPLAY_ORDER_COLOR = 'color'

type Props = {
  colors: Object,
  match: Object,
  filterByFamily: Function,
  family: string,
  displayOrder: string,
  hideColorFamilySelector: string
}

class ColorWall extends PureComponent<Props> {
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
    return this.allColors || (this.allColors = _.flatten(Object.keys(this.props.colors).map(family => {
      return this.colorFamily(family)
    })))
  }

  render () {
    const { colors, match: { params }, filterByFamily, family, displayOrder, hideColorFamilySelector } = this.props
    const colorFamilyKeys = ['All', ...Object.keys(colors)]

    const ColorWallButtons = colorFamilyKeys.map(key => {
      return <ColorWallButton key={key} family={key} selectFamily={filterByFamily} current={family} routeCurrent={params.family} />
    })

    // get either a specific color family or all families
    let ColorWallColors = (family === 'All') ? this.colorFamilies : this.colorFamily(family)

    // sort colors based on displayOrder prop if provided
    switch (displayOrder) {
      case DISPLAY_ORDER_LIGHTNESS:
        // $FlowIgnore
        ColorWallColors = _.sortBy(ColorWallColors, 'lightness', 'hue', 'saturation')
        break
      case DISPLAY_ORDER_COLOR:
        // $FlowIgnore
        ColorWallColors = _.sortBy(ColorWallColors, 'hue', 'lightness', 'saturation')
        break
      case DISPLAY_ORDER_SATURATION:
        // $FlowIgnore
        ColorWallColors = _.sortBy(ColorWallColors, 'saturation', 'hue', 'lightness')
        break
      case DISPLAY_ORDER_BRIGHTNESS:
        // $FlowIgnore
        ColorWallColors = _.sortBy(ColorWallColors, color => (color.saturation * color.lightness), 'hue')
        break
      case DISPLAY_ORDER_DEFAULT:
      default:
    }

    return (
      <React.Fragment>
        <div className='color-wall-buttons'>
          {/* TODO: Temporary string comparison logic until we have the configurations coming down as a service instead of through props. */}
          {(hideColorFamilySelector !== 'true') && ColorWallButtons}
        </div>
        <div ref={this.cwRef}>
          <ColorWallSwatchList key={family} colors={ColorWallColors} active={params.colorNumber} />
        </div>
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    }
  }
}

export default ColorDataWrapper(withRouter(connect(null, mapDispatchToProps)(ColorWall)))
