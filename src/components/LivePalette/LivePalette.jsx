/* eslint-disable react/self-closing-comp */

// @flow
import type { Color } from '../../shared/types/Colors'

import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import _ from 'lodash'

import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'

import { activate } from '../../actions/live-palette'

// import { varValues, varNames } from '../../shared/variables'

import EmptySlot from './EmptySlot'
import ActiveSlot from './ActiveSlot'

import './LivePalette.scss'

type Props = {
  colors: Array<Color>,
  activateColor: Function,
  activeColor: Color
}

class LivePalette extends PureComponent<Props> {
  render () {
    const { colors, activeColor } = this.props
    // TODO: abstract below into a class method
    // calculate all the active slots
    const activeSlots = colors.map((color, index) => {
      if (color && index < LP_MAX_COLORS_ALLOWED) {
        return <ActiveSlot key={color.id} color={color} onClick={this.activateColor} active={(activeColor.id === color.id)} />
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

  activateColor = (color) => {
    this.props.activateColor(color)
  }
}

const mapStateToProps = (state, props) => {
  const { lp } = state

  return {
    colors: lp.colors,
    activeColor: lp.activeColor
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    activateColor: (color) => {
      dispatch(activate(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LivePalette)
