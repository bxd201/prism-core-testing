/* eslint-disable react/self-closing-comp */

// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import _ from 'lodash'

// import { varValues, varNames } from '../../shared/variables'

import EmptySlot from './EmptySlot'
import LivePaletteSlot from './LivePaletteSlot'

import './LivePalette.scss'

type Props = {
  colors: Array
}

class LivePalette extends PureComponent<Props> {
  render () {
    // calculate all the active slots
    const activeSlots = this.props.colors.map((color, index) => {
      if (color && index < 7) {
        return <LivePaletteSlot key={color.id} color={color} />
      }
    })

    // after determining active slots, determine how many empty ones there should be
    let disabledSlots = []
    const additionalSlots = 7 - activeSlots.length
    if (additionalSlots > 0) {
      disabledSlots = _.times(additionalSlots, (index) => <EmptySlot key={index} />)
    }

    return (
      <div className='prism-live-palette'>
        <div className='prism-live-palette__list'>
          {activeSlots}
          <button className='prism-live-palette__slot prism-live-palette__slot--add'>
            <FontAwesomeIcon icon='plus-circle' size='2x' color='#2c97de' />
            <span className='prism-live-palette__slot__copy'>
              <FormattedMessage id='ADD_A_COLOR' />
            </span>
          </button>
          {disabledSlots}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { lp } = state

  return {
    colors: lp
  }
}

export default connect(mapStateToProps, null)(LivePalette)
