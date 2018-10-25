import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import { add } from '../../../actions/live-palette'

class ColorWallSwatch extends PureComponent {
  constructor (props) {
    super(props)

    this.handleSwatchClick = this.handleSwatchClick.bind(this)
  }

  render () {
    const { color, active } = this.props

    const Inner = {
      backgroundColor: color.hex
    }

    return (
      <React.Fragment>
        <li className='color-wall-swatches__swatch'
          onClick={this.handleSwatchClick}>
          <div className={`inner color-swatch-inner ${active ? 'color-swatch-inner--active' : ''}`}
            style={Inner} />
        </li>
      </React.Fragment>
    )
  }

  handleSwatchClick () {
    // const { match, color, family, addToLivePalette } = this.props
    // const { params } = match
    // const familyRoute = kebabCase(family)

    // if (params.colorNumber) {
    //   window.location.hash = `/active/color-wall/${familyRoute}`
    //   return
    // }
    // window.location.hash = `/active/color-wall/${familyRoute}/${color.colorNumber}`

    // TOOD: Remove after testing. Adding this so we can test the flow of adding a color to the LP from the CW
    this.props.addToLivePalette(this.props.color)
  }
}

ColorWallSwatch.propTypes = {
  addToLivePalette: PropTypes.func,
  color: PropTypes.object.isRequired,
  active: PropTypes.bool
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default withRouter(connect(null, mapDispatchToProps)(ColorWallSwatch))
