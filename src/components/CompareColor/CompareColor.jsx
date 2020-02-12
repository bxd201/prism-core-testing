// @flow
import React from 'react'
import { connect } from 'react-redux'
import { fullColorNumber, getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import type { Color } from '../../shared/types/Colors'
import type { Scene } from '../../shared/types/Scene'
import { toggleCompareColor } from '../../store/actions/live-palette'
import './CompareColor.scss'
import { StaticTintScene } from './StaticTintScene'
import { FormattedMessage } from 'react-intl'

const baseClass = 'color__comparison'
const containerClass = `${baseClass}__container`
const containerHeaderClass = `${baseClass}__container__header`
const containerHeaderButtonClass = `${baseClass}__container__header__button`
const wrapperClass = `${baseClass}__wrapper`
const prevBtnWrapperClass = `${baseClass}__prev-btn__wrapper`
const buttonsClass = `${baseClass}__buttons`
const buttonsVisibleClass = `${baseClass}__buttons--visible`
const nextBtnWrapperClass = `${baseClass}__next-btn__wrapper`
const backgroundColorClass = `${baseClass}__background__color`
const queueWrapperClass = `${baseClass}__queue__wrapper`
const colorInfoClass = `${baseClass}__color__info`
const colorInfoNumberClass = `${baseClass}__color__info__number`
const colorInfoNameClass = `${baseClass}__color__info__name`

const defaultViewItem = 3
const offset = 1

type CompareColorProps = {
  colors: Color[],
  toggleCompareColor: Function,
  colorsId: string[],
  scene: Scene | undefined
}

type CompareColorState = {
  colors: Color[],
  colorsId: string[],
  renderColors: Color[],
  curr: number,
  isHideNextButton: boolean,
  isHidePrevButton: boolean
}
export class CompareColor extends React.Component<CompareColorProps, CompareColorState> {
    state = {
      colors: this.props.colors,
      colorsId: this.props.colorsId,
      renderColors: [],
      curr: 0,
      isHidePrevButton: true,
      isHideNextButton: true
    };

    static getDerivedStateFromProps (props: CompareColorProps, state: CompareColorState) {
      if (props.colors !== state.colors) {
        return {
          colors: props.colors
        }
      }
      if (props.colorsId !== state.colorsId) {
        if (props.colorsId.length === state.colors.length - 1) {
          props.toggleCompareColor()
          return null
        }
        let currPointer = state.curr
        // when remove compared color id from color pallate
        if (props.colorsId.length > state.colorsId.length) {
          if (state.colors.length - props.colorsId.length <= defaultViewItem || currPointer === 0) {
            currPointer = 0
          } else {
            currPointer = currPointer - offset
          }
        }
        // when add compared color id from color pallate
        if (props.colorsId.length < state.colorsId.length) {
          if (state.colors.length - props.colorsId.length - 1 <= defaultViewItem) {
            currPointer = 0
          } else {
            currPointer = currPointer + 1
          }
        }
        return {
          colorsId: props.colorsId,
          curr: currPointer
        }
      }
      return null
    }

    renderContent = () => {
      const { curr, colors } = this.state
      const { scene } = this.props
      const renderColors = colors.filter((color: Color) => {
        return !this.props.colorsId.includes(color.id)
      })
      return renderColors && renderColors.map<Object>((color, key) => {
        return (
          <div key={key} style={{ backgroundColor: color.hex, transform: `translateX(-${curr * 100}%)` }} className={`${queueWrapperClass}`}>
            <div className={`${backgroundColorClass}`} />
            <StaticTintScene
              color={color}
              scene={scene}
            />
            <div style={{ color: getContrastYIQ(color.hex) }} className={`${colorInfoClass}`} >
              <span className={`${colorInfoNumberClass}`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
              <span className={`${colorInfoNameClass}`}>{color.name}</span>
            </div>
          </div>
        )
      })
    }

    isShowSlideButton = () => {
      const { curr, colors, colorsId } = this.state
      const itemsCount = colors.length - colorsId.length
      let buttonVisibility = {
        isHidePrevButton: true,
        isHideNextButton: true
      }
      if (curr === 0) {
        buttonVisibility.isHidePrevButton = true
      } else {
        buttonVisibility.isHidePrevButton = false
      }

      if (itemsCount > defaultViewItem && curr < itemsCount - defaultViewItem) {
        buttonVisibility.isHideNextButton = false
      }

      if (curr === itemsCount - defaultViewItem - offset / 2) {
        buttonVisibility.isHideNextButton = true
      }
      return buttonVisibility
    }

    handlePrev = () => {
      const { colors, curr, colorsId } = this.state
      const itemsCount = colors.length - colorsId.length
      if (itemsCount > defaultViewItem) {
        if (curr === (offset / 2)) {
          this.setState({ curr: curr - offset / 2 })
        } else {
          this.setState({ curr: curr - offset })
        }
      }
    }

    handleNext = () => {
      const { colors, curr, colorsId } = this.state
      const itemsCount = colors.length - colorsId.length
      if (itemsCount > defaultViewItem) {
        if (curr === itemsCount - defaultViewItem - 1) {
          this.setState({ curr: curr + offset / 2 })
        } else {
          this.setState({ curr: curr + offset })
        }
      }
    }

    render () {
      const content = this.renderContent()
      const { isHidePrevButton, isHideNextButton } = this.isShowSlideButton()
      return (
        <div className={`${containerClass}`}>
          <div className={`${containerHeaderClass}`}>
            <span><FormattedMessage id='COMPARE_COLORS' /></span>
            <button className={`${containerHeaderButtonClass}`} onClick={this.props.toggleCompareColor}><FormattedMessage id='CLOSE' /> &nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></button>
          </div>
          <div className={`${wrapperClass}`} >
            <div className={`${prevBtnWrapperClass}`}>
              {
                <button className={`${buttonsClass} ${isHidePrevButton ? `${buttonsVisibleClass}` : ''}`} onClick={this.handlePrev}>
                  <FontAwesomeIcon icon={['fa', 'chevron-left']} />
                </button>}
            </div>
            {content}
            <div className={`${nextBtnWrapperClass}`}>
              {
                <button className={`${buttonsClass} ${isHideNextButton ? `${buttonsVisibleClass}` : ''}`} onClick={this.handleNext}>
                  <FontAwesomeIcon icon={['fa', 'chevron-right']} />
                </button>
              }
            </div>
          </div>
        </div>
      )
    }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    toggleCompareColor: () => {
      dispatch(toggleCompareColor())
    }
  }
}
const mapStateToProps = (state: Object, props: Object) => {
  const { lp, scenes } = state
  const sceneType = scenes ? scenes.type : undefined

  return {
    colors: lp.colors,
    colorsId: lp.compareColorsId,
    scene: sceneType ? scenes.sceneCollection[sceneType][0] : undefined
  }
}

export {
  containerClass,
  containerHeaderClass,
  containerHeaderButtonClass,
  wrapperClass,
  prevBtnWrapperClass,
  buttonsClass,
  buttonsVisibleClass,
  nextBtnWrapperClass,
  backgroundColorClass,
  queueWrapperClass,
  colorInfoClass,
  colorInfoNumberClass,
  colorInfoNameClass
}

export default connect(mapStateToProps, mapDispatchToProps)(CompareColor)
