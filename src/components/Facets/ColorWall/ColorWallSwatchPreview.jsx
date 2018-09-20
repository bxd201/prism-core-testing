/* eslint-disable */

import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

class ColorWallSwatchPreview extends PureComponent {
  constructor (props) {
    super(props)
  }

  render () {
    const { color } = this.props
  
    if(!color)
      return null

    return (
      <React.Fragment>
        <div style={{ width: '150px', height: '150px', backgroundColor: color.hex }} />
      </React.Fragment>
    )
  }
}

ColorWallSwatchPreview.propTypes = {
  color: PropTypes.object
}

const mapStateToProps = (state, props) => {
  const { selectedColor } = state.scenes

  return {
    color: selectedColor
  }
}

export default connect(mapStateToProps, null)(ColorWallSwatchPreview)
