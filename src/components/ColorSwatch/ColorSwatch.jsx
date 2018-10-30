// @flow
import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'

import { add } from '../../actions/live-palette'

type Props = {
  selectColor: Function,
  color: Object // TODO: Create Color type
}

class ColorSwatch extends PureComponent<Props> {
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

  handleSwatchClick: Function = () => {
    this.props.selectColor(this.props.color)
  }
}

const mapDispatchToProps: Function = (dispatch) => {
  return {
    selectColor: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(null, mapDispatchToProps)(ColorSwatch)
