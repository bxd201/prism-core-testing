// @flow
import type { Color } from '../../shared/types/Colors'

import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import _ from 'lodash'
import update from 'immutability-helper'
import { Link } from 'react-router-dom'

import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'

import { activate, reorder } from '../../actions/live-palette'

import { varValues } from 'variables'

import EmptySlot from './EmptySlot'
import ActiveSlot from './ActiveSlot'

import './LivePalette.scss'

type Props = {
  colors: Array<any>,
  activateColor: Function,
  reorderColors: Function,
  activeColor: Color
}

class LivePalette extends PureComponent<Props> {
  pendingUpdateFn: any
  requestedFrame: number | void

  render () {
    const { colors, activeColor } = this.props

    // TODO: abstract below into a class method
    // calculate all the active slots
    const activeSlots = colors.map((color, index) => {
      if (color && index < LP_MAX_COLORS_ALLOWED) {
        return (<ActiveSlot
          index={index}
          key={color.id}
          color={color}
          onClick={this.activateColor}
          moveColor={this.moveColor}
          active={(activeColor.id === color.id)}
        />)
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
          {colors.length < LP_MAX_COLORS_ALLOWED && <Link to={`/active/color-wall`} className={`prism-live-palette__slot prism-live-palette__slot--${COLOR_TRAY_CLASS_MODIFIERS}`}>
            <FontAwesomeIcon className='prism-live-palette__icon' icon='plus-circle' size='lg' color={varValues.colors.swBlue} />
            <FormattedMessage id={ADD_COLOR_TEXT}>
              {(msg: string) => <span className='prism-live-palette__slot__copy'>{msg}</span>}
            </FormattedMessage>
          </Link>}
          {disabledSlots}
        </div>
      </div>
    )
  }

  activateColor = (color) => {
    this.props.activateColor(color)
  }

  scheduleUpdate = (updateFn) => {
    this.pendingUpdateFn = updateFn

    if (!this.requestedFrame) {
      this.requestedFrame = window.requestAnimationFrame(this.drawFrame)
    }
  }

  drawFrame = () => {
    const sortedColorsById = update([], this.pendingUpdateFn)

    // trigger the reordering via redux
    this.props.reorderColors(sortedColorsById)

    this.pendingUpdateFn = undefined
    this.requestedFrame = undefined
  }

  moveColor = (originColorId: Number, destinationColorId: Number) => {
    const { colors } = this.props
    // $FlowIgnore - ignoring flow validation on this line because _.flatMap's flow-type is more strict than lodash's actual implementation
    const colorsByIndex = _.flatMap(colors, color => color.id) // creates an array of only all color ids
    const originIndex = colorsByIndex.indexOf(originColorId) // get the index of the origin color
    const destIndex = colorsByIndex.indexOf(destinationColorId) // get the index of the dest color

    // shuffle the origin with the dest
    const from = colorsByIndex.splice(originIndex, 1)[0]
    colorsByIndex.splice(destIndex, 0, from)

    // schedule the rearrangement of a swatch with the browser
    this.scheduleUpdate({
      $push: colorsByIndex
    })
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
    },
    reorderColors: (colors) => {
      dispatch(reorder(colors))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LivePalette)
