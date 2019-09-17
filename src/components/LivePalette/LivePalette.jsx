// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import without from 'lodash/without'
import times from 'lodash/times'
import flatMap from 'lodash/flatMap'
import intersection from 'lodash/intersection'
import update from 'immutability-helper'
import { Link } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'

import { activate, reorder } from '../../store/actions/live-palette'
import { arrayToSpacedString } from '../../shared/helpers/StringUtils'

import { varValues } from 'variables'

import EmptySlot from './EmptySlot'
import ActiveSlot from './ActiveSlot'

import type { Color } from '../../shared/types/Colors'

import './LivePalette.scss'

type Props = {
  colors: Array<Color>,
  activateColor: Function,
  reorderColors: Function,
  activeColor: Color,
  removedColor: Color
}

type State = {
  spokenWord: string
}

export class LivePalette extends PureComponent<Props, State> {
  state = {
    spokenWord: ''
  }

  pendingUpdateFn: any
  requestedFrame: number | void
  activeSlotRef: ?RefObject = void (0)

  // $FlowIgnore
  componentDidUpdate (prevProps, prevState) {
    let spokenWord: Array<string> = []
    const prevColor = prevProps.activeColor
    const curColor = this.props.activeColor

    if (this.props.removedColor && prevProps.removedColor !== this.props.removedColor) {
      spokenWord.push(`${this.props.removedColor.name} has been removed.`)
    }

    if (curColor && prevColor !== curColor) {
      spokenWord.push(`${curColor.name} has been activated.`)

      // POC AHEAD
      // TODO: This depends on manual intervention to remove unhelpful color families. Type of color (red, yellow, etc) should be
      // determined programmatically based on color values.
      if (prevColor) {
        let mainFam = without(intersection(prevColor.colorFamilyNames, curColor.colorFamilyNames), 'Timeless Color', 'Historic Color', 'White & Pastel')[0]

        if (mainFam) {
          let prevLightness = prevColor.lightness
          let curLightness = curColor.lightness

          let brightnessDifference = (curLightness > prevLightness ? 'lighter' : curLightness < prevLightness ? 'darker' : void (0))

          if (brightnessDifference) {
            spokenWord.push(`${curColor.name} is a ${brightnessDifference} ${mainFam} than ${prevColor.name}`)
          }
        }
      }
      // END POC
    }

    if (spokenWord.length) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        spokenWord: arrayToSpacedString(spokenWord)
      })
    }
  }

  render () {
    const { colors, activeColor } = this.props

    const { spokenWord } = this.state
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
          active={(activeColor && activeColor.id === color.id)}
        />)
      }
    })

    // after determining active slots, determine how many empty ones there should be
    let disabledSlots = []
    const additionalSlots = (LP_MAX_COLORS_ALLOWED - 1) - activeSlots.length
    if (additionalSlots > 0) {
      disabledSlots = times(additionalSlots, (index) => <EmptySlot key={index} />)
    }

    const ADD_COLOR_TEXT = (colors.length) ? 'ADD_A_COLOR' : 'FIND_COLORS_IN_CW'
    const COLOR_TRAY_CLASS_MODIFIERS = (colors.length) ? 'add' : 'add-empty'

    return (
      <DndProvider backend={HTML5Backend}>
        <div className='prism-live-palette'>
          <div className='prism-live-palette__list'>
            {activeSlots}
            {colors.length < LP_MAX_COLORS_ALLOWED && <Link to={`/active/color-wall`} className={`prism-live-palette__slot prism-live-palette__slot--${COLOR_TRAY_CLASS_MODIFIERS}`}>
              <FontAwesomeIcon className='prism-live-palette__icon' icon={['fal', 'plus-circle']} size='2x' color={varValues.colors.swBlue} />
              <FormattedMessage id={ADD_COLOR_TEXT}>
                {(msg: string) => <span className='prism-live-palette__slot__copy'>{msg}</span>}
              </FormattedMessage>
            </Link>}
            {disabledSlots}
          </div>
          {/* This will speak the current and removed color, as well as some color-delta info. */}
          <aside aria-live='assertive' className='prism-live-palette__color-description'>{spokenWord}</aside>
        </div>
      </DndProvider>
    )
  }

  activateColor = (color: Color) => {
    this.props.activateColor(color)
  }

  moveColor = (dragIndex: Number, hoverIndex: Number) => {
    const { colors, reorderColors } = this.props
    const dragColor = colors[dragIndex]

    const sortedColors = update(colors, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragColor]]
    })

    // flatten the colors so it's an array of just the color IDs
    const sortedColorsByIndex = flatMap(sortedColors, color => color.id)

    reorderColors(sortedColorsByIndex)
  }
}

const mapStateToProps = (state, props) => {
  const { lp } = state
  return {
    colors: lp.colors,
    activeColor: lp.activeColor,
    // previousActiveColor: lp.previousActiveColor,
    removedColor: lp.removedColor
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
