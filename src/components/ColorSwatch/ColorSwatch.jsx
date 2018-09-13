import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { selectColor } from '../../actions/scenes'

class ColorSwatch extends PureComponent {
  constructor (props) {
    super(props)

    this.handleSwatchClick = this.handleSwatchClick.bind(this)
  }

  render () {
    const { color } = this.props

    return (
      <Fragment>
        <div style={{ backgroundColor: color.hex, width: '100px', height: '100px' }} onClick={this.handleSwatchClick} />
      </Fragment>
    )
  }

  handleSwatchClick () {
    this.props.selectColor(this.props.color)
  }
}

ColorSwatch.propTypes = {
  selectColor: PropTypes.func,
  color: PropTypes.object.isRequired
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectColor: (color) => {
      dispatch(selectColor(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(ColorSwatch)
