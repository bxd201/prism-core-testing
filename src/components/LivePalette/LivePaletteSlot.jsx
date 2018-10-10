import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

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
        <button className='prism-live-palette__slot prism-live-palette__slot--empty' style={{ backgroundColor: (color) ? color.hex : '' }}>
          <FontAwesomeIcon icon='plus-circle' size='lg' />
        </button>
      </React.Fragment>
    )
  }
}

LivePaletteSlot.PropTypes = {
  color: PropTypes.object
}

export default LivePaletteSlot
