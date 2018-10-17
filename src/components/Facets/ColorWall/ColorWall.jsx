import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

import { selectColor } from '../../../actions/colors'
import { filterByFamily } from '../../../actions/loadColors'

import ColorDataWrapper from '../../../helpers/ColorDataWrapper'

import ColorWallSwatch from './ColorWallSwatch'
import ColorWallButton from './ColorWallButton'

import './ColorWall.scss'

class ColorWall extends PureComponent {
  // constructor (props) {
  //   super(props)

  //   // this.props.loadColors()
  // }

  previewColor = debounce((color) => {
    this.props.selectColor(color)
  }, 250)

  colorFamilySwatch (family) {
    return this.props.colors[family].map(color => {
      return <ColorWallSwatch
        key={color.id}
        color={color}
        active={(color.colorNumber === this.props.match.params.colorNumber)}
        previewColor={this.previewColor}
        family={this.props.family}
      />
    })
  }

  get colorFamilySwatches () {
    return Object.keys(this.props.colors).map(family => {
      return this.colorFamilySwatch(family)
    })
  }

  render () {
    const { colors, match: { params }, filterByFamily, family } = this.props
    const colorFamilyKeys = ['All', ...Object.keys(colors)]

    const ColorWallButtons = colorFamilyKeys.map(key => {
      return <ColorWallButton key={key} family={key} selectFamily={filterByFamily} current={family} routeCurrent={params.family} />
    })

    const ColorWallSwatches = (family === 'All') ? this.colorFamilySwatches : this.colorFamilySwatch(family)

    return (
      <React.Fragment>
        <div className='color-wall-buttons'>
          {ColorWallButtons}
        </div>
        <div className={(params.colorNumber) ? '' : 'color-wall-swatches'} ref={this.cwRef} active={(params.colorNumber)}>
          {ColorWallSwatches.map(ColorFamily => ColorFamily)}
        </div>
      </React.Fragment>
    )
  }
}

ColorWall.propTypes = {
  colors: PropTypes.object,
  match: PropTypes.object,
  selectColor: PropTypes.func,
  filterByFamily: PropTypes.func,
  family: PropTypes.string
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectColor: (color) => {
      dispatch(selectColor(color))
    },
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    }
  }
}

export default ColorDataWrapper(withRouter(connect(null, mapDispatchToProps)(ColorWall)))
