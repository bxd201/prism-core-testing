import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

import { loadColors } from '../../../actions/loadColors'
import { selectColor } from '../../../actions/scenes'

import ColorWallSwatch from './ColorWallSwatch'

import './ColorWall.css'

class ColorWall extends PureComponent {
  constructor (props) {
    super(props)

    this.props.loadColors()
  }

  previewColor = debounce((color) => {
    this.props.selectColor(color)
  }, 250)

  render () {
    const { colors, match } = this.props
    const { params } = match
    const ColorWallSwatches = []

    Object.keys(colors).map(family => {
      const colorSwatches = colors[family].map(color => {
        return <ColorWallSwatch key={color.id} color={color} active={(color.colorNumber === params.colorNumber)} previewColor={this.previewColor} />
      })
      ColorWallSwatches.push(colorSwatches)
    })

    return (
      <React.Fragment>
        <div className={(params.colorNumber) ? '' : 'color-wall-swatches'} ref={this.cwRef} active={(params.colorNumber)}>
          {ColorWallSwatches.map(ColorFamily => ColorFamily)}
        </div>
      </React.Fragment>
    )
  }
}

ColorWall.propTypes = {
  colors: PropTypes.object,
  loadColors: PropTypes.func,
  match: PropTypes.object,
  selectColor: PropTypes.func
}

const mapStateToProps = (state, props) => {
  return {
    colors: state.colors.items || {}
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadColors: () => {
      dispatch(loadColors())
    },
    selectColor: (color) => {
      dispatch(selectColor(color))
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ColorWall))
