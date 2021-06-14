// @flow
import React, { PureComponent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import without from 'lodash/without'
import times from 'lodash/times'
import flatMap from 'lodash/flatMap'
import intersection from 'lodash/intersection'
import update from 'immutability-helper'
import LivePaletteModal from './LivePaletteModal'
import store from '../../store/store'
import { LP_MAX_COLORS_ALLOWED, MIN_COMPARE_COLORS_ALLOWED } from 'constants/configurations'
import { DndProvider } from 'react-dnd-cjs'
import HTML5Backend from 'react-dnd-html5-backend-cjs'
import InfoButton from 'src/components/InfoButton/InfoButton'

import { activate, reorder, toggleCompareColor, deactivateTemporaryColor, empty } from '../../store/actions/live-palette'
import { arrayToSpacedString } from '../../shared/helpers/StringUtils'

import { varValues } from 'src/shared/withBuild/variableDefs'

import ActiveSlot from './ActiveSlot'
import ActiveSlots from './ActiveSlots'
import EmptySlot from './EmptySlot'

import type { Color } from '../../shared/types/Colors.js.flow'

import './LivePalette.scss'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
import storageAvailable from '../../shared/utils/browserStorageCheck.util'
import { fullColorNumber } from '../../shared/helpers/ColorUtils'
import {
  setNavigationIntent,
  setNavigationIntentWithReturn
} from '../../store/actions/navigation'
import { ROUTES_ENUM } from '../Facets/ColorVisualizerWrapper/routeValueCollections'
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
  temporaryActiveColor: Color | null,
  setNavigationIntents: Function,
  isColorwallModallyPresented: boolean,
  isCompareColorShown: boolean,
  config: any
}

// @todo refactor to put state init in constructor and also bind handleAddColor, removing anon func call in render ...better yet this is a good hooks candidate... -RS
type State = {
  spokenWord: string,
  isCompareColor: boolean,
  isFastMaskPage: boolean
}

export class LivePalette extends PureComponent<Props, State> {
  state = {
    spokenWord: '',
    isCompareColor: false,
    isFastMaskPage: false
  }

  pendingUpdateFn: any
  requestedFrame: number | void
  activeSlotRef: ?RefObject = void (0)

  componentDidMount () {
    const pathName = window.location.pathname
    if (pathName.split('/').slice(-1)[0] === PATH__NAME) {
      this.setState({ isFastMaskPage: true })
    }
    // FIXME: Store should never be subscribed to by a component like this, it's non-uni-directional data flow.
    // FIXME: middleware can be used to respond to actions, specifically something testable like redux-saga
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
  handleAddColor = (e: SyntheticEvent) => {
    e.preventDefault()
    if (this.props.isColorwallModallyPresented) {
      return
    }

    this.props.setNavigationIntents(ROUTES_ENUM.COLOR_WALL, ROUTES_ENUM.ACTIVE)
  }

  render () {
    const { colors, activeColor, deactivateTemporaryColor, empty, temporaryActiveColor, isCompareColorShown } = this.props
    const { spokenWord, isFastMaskPage } = this.state
    const { compare, title } = this.props.config.cvw?.palette ?? {}

    // determine how many empty slots there should be
    let disabledSlots = []
    const additionalSlots = (LP_MAX_COLORS_ALLOWED - 1) - colors.length
    if (additionalSlots > 0) {
      disabledSlots = times(additionalSlots, (index) => <EmptySlot key={index} />)
    }

    const IS_EMPTY = !colors.length
    const ADD_COLOR_TEXT = IS_EMPTY ? 'FIND_COLORS_IN_CW' : 'ADD_A_COLOR'
    const COMPARE_COLORS_TEXT = 'COMPARE_COLORS'

    return (
      <DndProvider backend={HTML5Backend}>
        <div className='prism-live-palette'>
          <LivePaletteModal cancel={deactivateTemporaryColor} empty={empty} isActive={temporaryActiveColor !== null} />
          <div className='prism-live-palette__header'>
            <span className='prism-live-palette__header__name'>{title ?? <FormattedMessage id='PALETTE_TITLE' />}</span>
            {
              colors.length >= MIN_COMPARE_COLORS_ALLOWED &&
              (compare ?? <FormattedMessage id={COMPARE_COLORS_TEXT}>
                {
                  (msg: string) =>
                    <button
                      tabIndex='-1'
                      className={
                        !isFastMaskPage
                          ? 'prism-live-palette__header__compare-button'
                          : 'prism-live-palette__header__compare-button--hide'
                      }
                      onClick={this.toggleCompareColor}
                    >
                      {msg}
                    </button>
                }
              </FormattedMessage>)
            }
          </div>
          {activeColor && <div className='prism-live-palette__active-color' style={{ backgroundColor: activeColor.hex }}>
            <div className={`prism-live-palette__active-color__details ${(activeColor.isDark) ? `prism-live-palette__active-color__details--dark` : ``}`}>
              <span className='prism-live-palette__active-color__color-number'>{fullColorNumber(activeColor.brandKey, activeColor.colorNumber)}</span>
              <span className='prism-live-palette__active-color__color-name'>{ activeColor.name }</span>
            </div>
            <div className='prism-live-palette__active-color__info-button'>
              <InfoButton color={activeColor} />
            </div>
          </div>}
          <div className='prism-live-palette__list'>
            <ActiveSlots colors={colors} activeColor={activeColor}>
              <ActiveSlot onClick={this.activateColor} moveColor={this.moveColor} />
            </ActiveSlots>
            {colors.length < LP_MAX_COLORS_ALLOWED && !isCompareColorShown && <button onClick={(e) => {
              this.handleAddColor(e)
            }} className={`prism-live-palette__slot prism-live-palette__slot--${IS_EMPTY ? 'add-big' : 'add'}`}>
              <div className={`prism-live-palette__slot__guts ${IS_EMPTY ? 'prism-live-palette__slot__guts--hrzntl' : ''}`}>
                <FontAwesomeIcon className={`prism-live-palette__slot__icon ${IS_EMPTY ? 'prism-live-palette__slot__icon--left' : 'prism-live-palette__slot__icon--top'}`} icon={['fal', 'plus-circle']} size='2x' color={varValues._colors.primary} />
                <FormattedMessage id={ADD_COLOR_TEXT}>
                  {(msg: string) => <span className={`prism-live-palette__slot__copy ${IS_EMPTY ? 'prism-live-palette__slot__copy--right' : 'prism-live-palette__slot__copy--btm'}`}>{msg}</span>}
                </FormattedMessage>
              </div>
            </button>}
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
  const { lp, activeSceneLabel, isColorwallModallyPresented } = state
  return {
    colors: lp.colors,
    activeColor: lp.activeColor,
    // previousActiveColor: lp.previousActiveColor,
    removedColor: lp.removedColor,
    temporaryActiveColor: lp.temporaryActiveColor,
    activeSceneLabel,
    isColorwallModallyPresented,
    isCompareColorShown: lp.toggleCompareColor
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
    },
    setNavigationIntents: (shouldGoTo: string, shouldReturnTo: string | void) => {
      if (shouldGoTo && shouldReturnTo) {
        dispatch(setNavigationIntentWithReturn(shouldGoTo, shouldReturnTo))
        return
      }
      dispatch(setNavigationIntent(shouldGoTo))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WithConfigurationContext(LivePalette))
