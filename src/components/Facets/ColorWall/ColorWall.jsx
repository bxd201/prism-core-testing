// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter, Route } from 'react-router-dom'
import { flatten, sortBy } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { filterByFamily } from '../../../actions/loadColors'
import { add } from '../../../actions/live-palette'

import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

import ColorDetails from '../../ColorDetails/ColorDetails'
import ColorWallSwatchList from './ColorWallSwatchList'
import ColorWallButton from './ColorWallButton'

import { type Color } from '../../../shared/types/Colors'

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
  addToLivePalette: Function,
  family: string,
  displayOrder: string,
  hideColorFamilySelector: string
}

type State = {
  activeColor?: Color
}

class ColorWall extends PureComponent<Props, State> {
  previewColor = void (0)
  allColors = void (0)

  state: State = {
    activeColor: void (0)
  }

  static defaultProps = {
    displayOrder: DISPLAY_ORDER_DEFAULT
  }

  constructor (props: Props) {
    super(props)

    this.filterByFamily = this.filterByFamily.bind(this)
    this.handleActivateColor = this.handleActivateColor.bind(this)

  render () {
    const { colors, match: { params }, addToLivePalette, family, displayOrder, hideColorFamilySelector } = this.props
    const { activeColor } = this.state

    const colorFamilyKeys = ['All', ...Object.keys(colors)]

    const ColorWallButtons = colorFamilyKeys.map(key => {
      return <ColorWallButton key={key} family={key} selectFamily={this.filterByFamily} current={family} routeCurrent={params.family} />
    })

    // get either a specific color family or all families
    let ColorWallColors = (family === 'All') ? this.colorFamilies : this.colorFamily(family)

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
        <div className='color-wall-buttons'>
          {/* TODO: Temporary string comparison logic until we have the configurations coming down as a service instead of through props. */}
          {(hideColorFamilySelector !== 'true') && ColorWallButtons}
        </div>
        <div className='color-wall-wall'>
          {activeColor ? (
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
              onActivateColor={this.handleActivateColor} />
          )}
          {activeColor && (
            <div className='color-wall-wall__btns'>
              <button title='Zoom Out' type='button' className='color-wall-wall__btns__btn' onClick={this.zoomOut}>
                <FontAwesomeIcon icon='search-minus' />
              </button>
            </div>
          )}
        </div>
        <Route path='/active/color-wall/color-details/:colorNumber' exact render={this.renderColorDetails} />
      </React.Fragment>
    )
  }

  filterByFamily = function filterByFamily (family) {
    this.props.filterByFamily(family)
    this.setState({
      activeColor: void (0)
    })
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

  renderColorDetails (props) {
    // return <ColorDetails {...props} />
  }

  zoomOut = function zoomOut () {
    this.setState({ activeColor: void (0) })
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    },
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default ColorDataWrapper(withRouter(connect(null, mapDispatchToProps)(ColorWall)))
