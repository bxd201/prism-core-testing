import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { loadColors } from '../../actions/loadColors'

import ColorSwatch from '../ColorSwatch/ColorSwatch'

class ColorList extends PureComponent {
  constructor (props) {
    super(props)

    this.props.loadColors()
  }

  render () {
    const colorListMarkup = this.props.colors.map(color => {
      return <ColorSwatch key={color.id} color={color} />
    })

    return (
      <div style={{ position: 'absolute', bottom: '0px', display: 'flex', overflow: 'scroll', width: '900px', height: '300px', flexWrap: 'wrap' }}>
        {colorListMarkup}
      </div>
    )
  }
}

ColorList.propTypes = {
  colors: PropTypes.array,
  loadColors: PropTypes.func
}

const mapStateToProps = (state, props) => {
  return {
    colors: state.colors.items || []
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadColors: () => {
      dispatch(loadColors())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColorList)
