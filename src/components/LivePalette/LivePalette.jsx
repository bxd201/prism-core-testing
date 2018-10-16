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

import { varValues } from 'variables'

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

    const ADD_COLOR_TEXT = (colors.length) ? 'ADD_A_COLOR' : 'FIND_COLORS_IN_CW'
    const COLOR_TRAY_CLASS_MODIFIERS = (colors.length) ? 'add' : 'add-empty'

    return (
      <div className='prism-live-palette'>
        <div className='prism-live-palette__list'>
          {activeSlots}
          <button className={`prism-live-palette__slot prism-live-palette__slot--${COLOR_TRAY_CLASS_MODIFIERS}`}>
            <FontAwesomeIcon className='prism-live-palette__icon' icon='plus-circle' size='lg' color={varValues.colors.swBlue} />
            <FormattedMessage id={ADD_COLOR_TEXT}>
              {(msg) => <span className='prism-live-palette__slot__copy'>{msg}</span>}
            </FormattedMessage>
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

const mapDispatchToProps = (dispatch: Function) => {
  return {
    activateColor: (color) => {
      dispatch(activate(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LivePalette)
