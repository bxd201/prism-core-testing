import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { loadColors } from '../actions/loadColors'

/**
 * HOC for ensuring color data is loaded before rendering the component
 * @param {component} WrappedComponent
 */
const ColorDataWrapper = WrappedComponent => {
  class ColorData extends React.Component {
    constructor (props) {
      super(props)

      this.props.loadColors()
    }

    render () {
      if (!this.props.colors) {
        return <p>Loading....</p>
      }

      return <WrappedComponent {...this.props} />
    }
  }

  ColorData.propTypes = {
    colors: PropTypes.object,
    loadColors: PropTypes.func
  }

  const mapStateToProps = (state, props) => {
    return {
      colors: state.colors.items
    }
  }

  const mapDispatchToProps = (dispatch) => {
    return {
      loadColors: () => {
        dispatch(loadColors())
      }
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(ColorData)
}

export default ColorDataWrapper
