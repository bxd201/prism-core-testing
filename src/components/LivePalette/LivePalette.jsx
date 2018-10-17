/* eslint-disable react/self-closing-comp */

// @flow
import type { Color } from '../../shared/types/Colors'

import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import _ from 'lodash'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'

import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'

import { activate, reorder } from '../../actions/live-palette'

import { varValues } from 'variables'

import EmptySlot from './EmptySlot'
import ActiveSlot from './ActiveSlot'

import './LivePalette.scss'

type Props = {
  colors: Array<Color>,
  activateColor: Function,
  reorderColors: Function,
  activeColor: Color
}

class LivePalette extends PureComponent<Props> {
  render () {
    const { colors, activeColor } = this.props
    // TODO: abstract below into a class method
    // calculate all the active slots
    const activeSlots = colors.map((color, index) => {
      if (color && index < LP_MAX_COLORS_ALLOWED) {
        return (<ActiveSlot
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
          <button className={`prism-live-palette__slot prism-live-palette__slot--${COLOR_TRAY_CLASS_MODIFIERS}`}>
            <FontAwesomeIcon className='prism-live-palette__icon' icon='plus-circle' size='lg' color={varValues.colors.swBlue} />
            <FormattedMessage id={ADD_COLOR_TEXT}>
              {(msg: string) => <span className='prism-live-palette__slot__copy'>{msg}</span>}
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

  moveColor = (originColorId, destinationColorId) => {
    const { colors } = this.props
    const colorsByIndex = _.flatMap(colors, color => color.id) // creates an array of only all color ids
    const originIndex = colorsByIndex.indexOf(originColorId)
    const destIndex = colorsByIndex.indexOf(destinationColorId)

    const from = colorsByIndex.splice(originIndex, 1)[0]
    colorsByIndex.splice(destIndex, 0, from)

    // reconstruct the colors array object
    const reconstructedColors = []
    for (let id = 0; id < colorsByIndex.length; id++) {
      const color = _.filter(colors, color => (color.id === colorsByIndex[id]))[0]
      reconstructedColors.push(color)
    }

    this.props.reorderColors(reconstructedColors)
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

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(LivePalette))
