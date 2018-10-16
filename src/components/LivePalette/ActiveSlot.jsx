import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { remove } from '../../actions/live-palette'

// import { varValues, varNames } from 'variables'

class LivePaletteSlot extends PureComponent<Props> {
  ACTIVE_CLASS = 'prism-live-palette__slot--active'
  REMOVAL_CLASS = 'prism-live-palette__slot--removing'

  state = {
    isDeleting: false
  }

  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
    this.remove = this.remove.bind(this)
  }

  render () {
    const { color, active } = this.props
    const { isDeleting } = this.state

    return (
      <React.Fragment>
        <div className={`prism-live-palette__slot ${(active ? this.ACTIVE_CLASS : '')} ${(isDeleting ? this.REMOVAL_CLASS : '')}`} style={{ backgroundColor: color.hex }} onClick={this.onClick}>
          <div className='prism-live-palette__color-details'>
            <span className='prism-live-palette__color-number'>{ color.colorNumber }</span>
            <span className='prism-live-palette__color-name'>{ color.name }</span>
            <button className='prism-live-palette__trash' onClick={this.remove}><FontAwesomeIcon icon='trash' size='1x' /></button>
          </div>
        </div>
      </React.Fragment>
    )
  }

  onClick () {
    // only trigger the onClick and activating the swatch if it's not already active.
    // this should prevent an additional re-render since clicking on the move icon also triggers the click
    // on the swatch itself
    if (!this.props.active) {
      this.props.onClick(this.props.color)
    }
  }

  remove () {
    const { color } = this.props

    this.setState({ isDeleting: true })

    setTimeout(() => {
      this.props.remove(color.id)
    }, 200)
  }
}

LivePaletteSlot.propTypes = {
  color: PropTypes.object,
  remove: PropTypes.func,
  onClick: PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
  return {
    remove: (colorId) => {
      dispatch(remove(colorId))
    }
  }
}

export default connect(null, mapDispatchToProps)(LivePaletteSlot)
