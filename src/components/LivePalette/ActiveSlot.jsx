import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { remove } from '../../actions/live-palette'

// import { varValues, varNames } from '../../shared/variables'

class LivePaletteSlot extends PureComponent<Props> {
  ACTIVE_CLASS = 'prism-live-palette__slot--active'

  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }

  render () {
    const { color, active } = this.props

    return (
      <React.Fragment>
        <div className={`prism-live-palette__slot ${(active ? this.ACTIVE_CLASS : '')}`} style={{ backgroundColor: color.hex }} onClick={this.onClick}>
          <div className='prism-live-palette__slot__details'>
            <p>{ color.colorNumber }</p>
            <strong>{ color.name }</strong>
            <button onClick={() => this.props.remove(color.id)}><FontAwesomeIcon icon='trash' size='lg' /></button>
          </div>
        </div>
      </React.Fragment>
    )
  }

  onClick () {
    this.props.onClick(this.props.color)
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
