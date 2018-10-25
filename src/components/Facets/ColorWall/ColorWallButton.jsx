import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import kebabCase from 'lodash/kebabCase'

class ColorWallButton extends PureComponent {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  render () {
    const { family, current, routeCurrent } = this.props
    const isChecked = (kebabCase(family) === routeCurrent || family === current)

    return (
      <React.Fragment>
        <input
          type='radio'
          className='color-wall-button'
          name='selectedFamily'
          id={`family-${family}`}
          onClick={this.handleClick}
          value={family}
          defaultChecked={isChecked}
        />
        <label className='color-wall-label' htmlFor={`family-${family}`}>
          {family}
        </label>
      </React.Fragment>
    )
  }

  handleClick () {
    this.props.selectFamily(this.props.family)

    window.location.hash = `/active/color-wall/${kebabCase(this.props.family)}`
  }
}

ColorWallButton.propTypes = {
  family: PropTypes.string,
  current: PropTypes.string,
  selectFamily: PropTypes.func,
  routeCurrent: PropTypes.string
}

export default ColorWallButton
