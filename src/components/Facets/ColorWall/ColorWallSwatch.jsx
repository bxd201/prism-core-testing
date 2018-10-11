/* eslint-disable */

import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import kebabCase from 'lodash/kebabCase'

import { selectColor } from '../../../actions/scenes'

const SwatchOuter = styled.li`
  width: 16px;
  cursor: pointer;
  display: inline-block;
  list-style-type: none;
  position: relative;
`
const SwatchPlaceholder = styled.div`
  height: 0;
  margin-bottom: 100%;
  width: 100%;
`
const SwatchInner = styled.div`
  background: ${props => props.color.cssrgb};
  border: 1px solid #f2f2f2;
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  transform: translateZ(0);
  transition-property: left,top,width,height;
  transition-duration: .3s;
  transition-timing-function: ease-in;
  width: 100%;
`

class ColorWallSwatch extends PureComponent {
  constructor (props) {
    super(props)

    this.swatchRef = React.createRef()
    this.handleSwatchClick = this.handleSwatchClick.bind(this)
    this.handleSwatchHover = this.handleSwatchHover.bind(this)
    this.handleSwatchMouseOut = this.handleSwatchMouseOut.bind(this)
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
      backgroundColor: color.hex,
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
          <div className="inner color-swatch-inner" style={(active) ? ActiveInner : Inner} onMouseEnter={this.handleSwatchHover} onMouseLeave={this.handleSwatchMouseOut} />
        </li>
      </React.Fragment>
    )
  }

  handleSwatchClick (e) {
    const { match, color, family } = this.props
    const { params } = match
    const familyRoute = kebabCase(family)

    if (params.colorNumber) {
      window.location.hash = `/active/color-wall/${familyRoute}`
      return;
    }
    window.location.hash = `/active/color-wall/${familyRoute}/${color.colorNumber}`
  }

  handleSwatchHover (e) {
    const { match } = this.props
    const { params } = match

    if (!params.colorNumber)
      this.props.previewColor(this.props.color)
  }

  handleSwatchMouseOut (e) {
    // this.setState({ hoverActive: false })
  }
}

ColorWallSwatch.propTypes = {
  selectColor: PropTypes.func,
  previewColor: PropTypes.func,
  color: PropTypes.object.isRequired,
  active: PropTypes.bool,
  family: PropTypes.string
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectColor: (color) => {
      dispatch(selectColor(color))
    }
  }
}

export default withRouter(connect(null, mapDispatchToProps)(ColorWallSwatch))
