/* eslint-disable */

import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { kebabCase } from 'lodash'

import { filterByFamily } from '../../../actions/loadColors'

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
          type="radio"
          className="color-wall-button"
          name="selectedFamily"
          id={`family-${family}`}
          onClick={this.handleClick}
          value={family}
          defaultChecked={isChecked}
        />
        <label className="color-wall-label" htmlFor={`family-${family}`}>
          {family}
        </label>
      </React.Fragment>
    )
  }

  handleClick (e) {
    this.props.filterByFamily(e.target.value)

    window.location.hash = `/active/color-wall/${kebabCase(e.target.value)}`
  }
}

ColorWallButton.propTypes = {
  family: PropTypes.string,
  current: PropTypes.string,
  filterByFamily: PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
  return {
    filterByFamily: (family) => {
      dispatch(filterByFamily(family))
    }
  }
}

export default connect(null, mapDispatchToProps)(ColorWallButton)
