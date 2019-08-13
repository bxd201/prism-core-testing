// @flow
import React from 'react'
import { connect } from 'react-redux'
import { fullColorNumber, getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import type { Color } from '../../shared/types/Colors'
import { toggleCompareColor } from '../../store/actions/live-palette'
import './CompareColor.scss'
import { StaticTintScene } from './TintableScene'
import { Scene } from './data'

const baseClass = 'color__comparison'
const defaultViewItem = 3
const offset = 1

type CompareColorProps = {
  colors: Color[],
  toggleCompareColor: Function,
  colorsId: string[]
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
      const renderColors = colors.filter((color: Color) => {
        return !this.props.colorsId.includes(color.id)
      })
      return renderColors && renderColors.map<Object>((color, key) => {
        return (
          <div key={key} style={{ backgroundColor: color.hex, transform: `translateX(-${curr * 100}%)` }} className={`${baseClass}__queue__wrapper`}>
            <div className={`${baseClass}__background__color`} />
            <StaticTintScene
              color={color}
              scene={Scene}
            />
            <div style={{ color: getContrastYIQ(color.hex) }} className={`${baseClass}__color__info`} >
              <span className={`${baseClass}__color__info__number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</span>
              <span className={`${baseClass}__color__info__name`}>{color.name}</span>
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
        <div className={`${baseClass}__container`}>
          <div className={`${baseClass}__container__header`}>
            <span>Compare Colors</span>
            <button className={`${baseClass}__container__header__button`} onClick={this.props.toggleCompareColor}>close &nbsp;<FontAwesomeIcon className={``} icon={['fa', 'chevron-up']} /></button>
          </div>
          <div className={`${baseClass}__wrapper`} >
            <div className={`${baseClass}__prev-btn__wrapper`}>
              {
                <button className={`${baseClass}__buttons ${isHidePrevButton ? `${baseClass}__buttons--visible` : ''}`} onClick={this.handlePrev}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>}
            </div>
            {content}
            <div className={`${baseClass}__next-btn__wrapper`}>
              {
                <button className={`${baseClass}__buttons ${isHideNextButton ? `${baseClass}__buttons--visible` : ''}`} onClick={this.handleNext}>
                  <FontAwesomeIcon icon={faChevronRight} />
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
  const { lp } = state
  return {
    colors: lp.colors,
    colorsId: lp.compareColorsId
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CompareColor)
