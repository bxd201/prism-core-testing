// @flow
import React, { PureComponent, createRef } from 'react'
import 'src/providers/fontawesome/fontawesome'
import { connect } from 'react-redux'
import without from 'lodash/without'
import flatMap from 'lodash/flatMap'
import intersection from 'lodash/intersection'
import update from 'immutability-helper'
import LivePaletteModal from './LivePaletteModal'
import store from '../../store/store'
import { LP_MAX_COLORS_ALLOWED } from 'constants/configurations'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import InfoButton from 'src/components/InfoButton/InfoButton'

import { activate, reorder, toggleCompareColor, deactivateTemporaryColor, empty } from '../../store/actions/live-palette'
import { arrayToSpacedString } from '../../shared/helpers/StringUtils'

import SimpleActiveSlot from './SimpleActiveSlot'

import type { Color } from '../../shared/types/Colors.js.flow'

import storageAvailable from '../../shared/utils/browserStorageCheck.util'
import { fullColorNumber } from '../../shared/helpers/ColorUtils'

import './SimpleLivePalette.scss'

const PATH__NAME = 'fast-mask-simple.html'

type Props = {
  colors: Array<Color>,
  activateColor: Function,
  reorderColors: Function,
  toggleCompareColor: Function,
  activeColor: Color,
  removedColor: Color,
  deactivateTemporaryColor: Function,
  empty: Function,
  temporaryActiveColor: Color | null
}

type State = {
  spokenWord: string,
  isCompareColor: boolean,
  isFastMaskPage: boolean,
  sideSwatch: number
}

const checkIsActive = (activeColor, color) => {
  if (!activeColor) {
    return false
  }

  return activeColor.id === color.id
}

export class LivePalette extends PureComponent<Props, State> {
  pendingUpdateFn: any
  requestedFrame: number | void
  activeSlotRef: ?RefObject = void (0)

  constructor () {
    super()

    this.state = {
      spokenWord: '',
      isCompareColor: false,
      isFastMaskPage: false,
      swatchSide: 0
    }

    this.wrapperRef = createRef()
  }

  componentDidMount () {
    const { width } = this.wrapperRef.current.getBoundingClientRect()
    const swatchMax = LP_MAX_COLORS_ALLOWED || 7
    const side = Math.floor(width / swatchMax)

    this.setState({ swatchSide: side })

    const pathName = window.location.pathname
    if (pathName.split('/').slice(-1)[0] === PATH__NAME) {
      this.setState({ isFastMaskPage: true })
    }
    store.subscribe(() => {
      const { lp } = store.getState()
      if (storageAvailable('localStorage')) {
        window.localStorage.setItem('lp', JSON.stringify(lp))
      }
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
    const { colors, activeColor, deactivateTemporaryColor, empty, temporaryActiveColor } = this.props
    const { spokenWord, isCompareColor } = this.state
    // TODO: abstract below into a class method
    // calculate all the active slots
    const activeSlots = colors.filter(item => item && !!item.id).map((color, index) => {
      if (color && index < LP_MAX_COLORS_ALLOWED) {
        const isActive = checkIsActive(activeColor, color)
        const swatchStyles = isActive ? { height: this.state.swatchSide } : { width: this.state.swatchSide, height: this.state.swatchSide }
        return (<SimpleActiveSlot
          index={index}
          key={color.id}
          color={color}
          onClick={this.activateColor}
          moveColor={this.moveColor}
          active={isActive}
          isCompareColor={isCompareColor}
          swatchStyles={swatchStyles}
        />)
      }
    })

    return (
      <DndProvider backend={HTML5Backend}>
        <div ref={this.wrapperRef} className='simple-prism-live-palette'>
          <LivePaletteModal cancel={deactivateTemporaryColor} empty={empty} isActive={temporaryActiveColor !== null} />
          {activeColor && <div className='simple-prism-live-palette__active-color' style={{ backgroundColor: activeColor.hex }}>
            <div className={`simple-prism-live-palette__active-color__details ${(activeColor.isDark) ? `simple-prism-live-palette__active-color__details--dark` : ``}`}>
              <span className='simple-prism-live-palette__active-color__color-number'>{fullColorNumber(activeColor.brandKey, activeColor.colorNumber)}</span>
              <span className='simple-prism-live-palette__active-color__color-name'>{ activeColor.name }</span>
            </div>
            <div className='simple-prism-live-palette__active-color__info-button'>
              <InfoButton color={activeColor} />
            </div>
          </div>}
          <div className='simple-prism-live-palette__list'>
            {activeSlots}
          </div>
          {/* This will speak the current and removed color, as well as some color-delta info. */}
          <aside aria-live='assertive' className='simple-prism-live-palette__color-description'>{spokenWord}</aside>
        </div>
      </DndProvider>
    )
  }

  activateColor = (color: Color) => {
    this.props.activateColor(color)
  }

  moveColor = (dragIndex: number, hoverIndex: number) => {
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
    removedColor: lp.removedColor,
    temporaryActiveColor: lp.temporaryActiveColor
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
    deactivateTemporaryColor: () => {
      dispatch(deactivateTemporaryColor())
    },
    empty: () => {
      dispatch(empty())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LivePalette)
