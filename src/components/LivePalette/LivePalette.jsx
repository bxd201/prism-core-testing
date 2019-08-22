// @flow
import type { Color } from '../../shared/types/Colors'

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
import LivePaletteModal from './LivePaletteModal'
import store from '../../store/store'
import { LP_MAX_COLORS_ALLOWED, MIN_COMPARE_COLORS_ALLOWED } from 'constants/configurations'

import { activate, reorder, toggleCompareColor, cancel, empty } from '../../store/actions/live-palette'
import { arrayToSpacedString } from '../../shared/helpers/StringUtils'

import { varValues } from 'variables'

import EmptySlot from './EmptySlot'
import ActiveSlot from './ActiveSlot'

import './LivePalette.scss'

type Props = {
  colors: Array<Color>,
  activateColor: Function,
  reorderColors: Function,
  toggleCompareColor: Function,
  activeColor: Color,
  removedColor: Color,
  cancel: Function,
  empty: Function
}

type State = {
  spokenWord: string,
  isCompareColor: boolean
}

export class LivePalette extends PureComponent<Props, State> {
  state = {
    spokenWord: '',
    isCompareColor: false
  }

  pendingUpdateFn: any
  requestedFrame: number | void
  activeSlotRef: ?RefObject = void (0)

  constructor (props: Props) {
    super(props)

    this.activeSlotRef = React.createRef()
  }

  componentDidMount () {
    store.subscribe(() => {
      const { lp } = store.getState()
      window.localStorage.setItem('lp', JSON.stringify(lp))
    })
  }
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

  toggleCompareColor = () => {
    this.setState({ isCompareColor: !this.state.isCompareColor })
    this.props.toggleCompareColor()
  }

  render () {
    const { colors, activeColor, cancel, empty } = this.props

    const { spokenWord, isCompareColor } = this.state
    // TODO: abstract below into a class method
    // calculate all the active slots
    const activeSlots = colors.map((color, index) => {
      if (color && index < LP_MAX_COLORS_ALLOWED) {
        return (<ActiveSlot
          ref={this.activeSlotRef}
          node={this.activeSlotRef} // passing the ref down as a prop so DnD has access to the DOM element
          index={index}
          key={color.id}
          color={color}
          onClick={this.activateColor}
          moveColor={this.moveColor}
          active={(activeColor.id === color.id)}
          isCompareColor={isCompareColor}
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
      <div className='prism-live-palette'>
        <LivePaletteModal cancel={cancel} empty={empty} isActive={colors.length > LP_MAX_COLORS_ALLOWED} />
        <div className='prism-live-palette__header'>
          <span className='prism-live-palette__header__name'><FormattedMessage id='PALETTE_TITLE' /></span>
          {colors.length >= MIN_COMPARE_COLORS_ALLOWED && <button className='prism-live-palette__header__compare-button' onClick={this.toggleCompareColor}>Compare Color</button>}
        </div>
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
    )
  }

  activateColor = (color: Color) => {
    this.props.activateColor(color)
  }

  scheduleUpdate = (updateFn: Function) => {
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
    const colorsByIndex = flatMap(colors, color => color.id) // creates an array of only all color ids
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
    activeColor: lp.activeColor,
    // previousActiveColor: lp.previousActiveColor,
    removedColor: lp.removedColor
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    toggleCompareColor: () => {
      dispatch(toggleCompareColor())
    },
    activateColor: (color) => {
      dispatch(activate(color))
    },
    reorderColors: (colors) => {
      dispatch(reorder(colors))
    },
    cancel: () => {
      dispatch(cancel())
    },
    empty: () => {
      dispatch(empty())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LivePalette)
