import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { remove } from '../../actions/live-palette'

// import { varValues, varNames } from '../../shared/variables'

class LivePaletteSlot extends PureComponent<Props> {
  ACTIVE_CLASS = 'prism-live-palette--active'

  constructor (props) {
    super(props)

    this.state = {
      active: false
    }
  }

  render () {
    const { color } = this.props

    return (
      <React.Fragment>
        <div className='prism-live-palette__slot' style={{ backgroundColor: color.hex }}>
          <button onClick={() => this.props.remove(color.id)}><FontAwesomeIcon icon='trash' size='lg' /></button>
        </div>
      </React.Fragment>
    )
  }
}

LivePaletteSlot.propTypes = {
  color: PropTypes.object,
  remove: PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
  return {
    remove: (colorId) => {
      dispatch(remove(colorId))
    }
  }
}

export default connect(null, mapDispatchToProps)(LivePaletteSlot)
