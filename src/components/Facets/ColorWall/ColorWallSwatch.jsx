import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
// import kebabCase from 'lodash/kebabCase'

import { add } from '../../../actions/live-palette'

class ColorWallSwatch extends PureComponent {
  constructor (props) {
    super(props)

    this.swatchRef = React.createRef()
    this.handleSwatchClick = this.handleSwatchClick.bind(this)
    this.handleSwatchHover = this.handleSwatchHover.bind(this)
  }

  render () {
    const { color, active } = this.props

    const Outer = {
      width: 'calc(99.9%/56)',
      cursor: 'pointer',
      display: 'inline-block',
      position: 'relative'
    }
    const Placeholder = {
      height: 0,
      marginBottom: '100%',
      width: '100%'
    }
    const Inner = {
      backgroundColor: color.hex
    }
    const ActiveInner = {
      backgroundColor: color.hex,
      border: '1px solid #f2f2f2',
      position: 'absolute',
      overflow: 'hidden',
      transform: 'translateZ(0)',
      transitionProperty: 'left,top,width,height',
      transitionDuration: '.3s',
      transitionTimingFunction: 'ease-in',
      height: '360%',
      width: '360%',
      left: '-125%',
      top: '-125%',
      zIndex: '216'
    }

    return (
      <React.Fragment>
        <li ref={this.swatchRef} style={Outer} onClick={this.handleSwatchClick}>
          <div style={Placeholder} />
          <div className='inner color-swatch-inner' style={(active) ? ActiveInner : Inner} onMouseEnter={this.handleSwatchHover} onMouseLeave={this.handleSwatchMouseOut} />
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

  handleSwatchHover (e) {
    const { match } = this.props
    const { params } = match

    if (!params.colorNumber) {
      // TODO: uncomment & re-implement if we want to move forward with the idea of a live-preview as the user hovers
      // this.props.previewColor(this.props.color)
    }
  }
}

ColorWallSwatch.propTypes = {
  addToLivePalette: PropTypes.func,
  color: PropTypes.object.isRequired,
  active: PropTypes.bool,
  // family: PropTypes.string,
  match: PropTypes.object
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default withRouter(connect(null, mapDispatchToProps)(ColorWallSwatch))
