// @flow
import React, { PureComponent, Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux'
import { add } from '../../store/actions/live-palette'
import { getlpColorByNumber } from '../../../__mocks__/data/color/Colors'
import type { Color } from '../../../src/shared/types/Colors'
import some from 'lodash/some'
import { LiveMessage } from 'react-aria-live'
import './ColorPins.scss'
import { activedPinsHalfWidth } from './data'
import { getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'

type Props = {
  activatePin: Function,
  isActiveFlag: boolean,
  isContentLeft: boolean,
  translateX: number,
  translateY: number,
  RGBstring: string,
  previewColorName: string,
  previewColorNumber: string,
  pinNumber: number,
  addColors: Color[],
  addToLivePalette: Function,
  handleDrag: Function,
  deleteCurrentPin: Function,
  handleDragStop: Function,
  handlePinMoveByKeyboard: Function,
  handleKeyUpAfterPinMove: Function,
  hide: boolean,
  isMovingPin: boolean
}

type State = {
  isColorDivFocused: boolean
}

export const CLASSES = {
  BASE: 'pin__wrapper',
  CHECKBOX: 'visually-hidden'
}

const KEY_CODE_TAB = 9
const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32
const KEY_CODE_ARROW_LEFT = 37
const KEY_CODE_ARROW_UP = 38
const KEY_CODE_ARROW_RIGHT = 39
const KEY_CODE_ARROW_DOWN = 40
const PIN_MOVEMENT_INTERVAL = 10
const PIN_MOVEMENT_SHIFT_KEY_INTERVAL = 1

export class ColorsFromImagePin extends PureComponent<Props, State> {
  colorDivRef: RefObject
  constructor (props) {
    super(props)
    this.colorDivRef = React.createRef()
    this.state = { isColorDivFocused: true }
  }

  componentDidUpdate () {
    if (this.props.isMovingPin === true) {
      this.focusHandler()
    }
  }

  handleColorAdd = (e: Object, colorObject: Object) => {
    e.stopPropagation()
    this.props.addToLivePalette(colorObject)
  }

  onClickHandlerLabel = (e: Object) => {
    e.preventDefault()
    e.stopPropagation()
    this.props.activatePin(this.props.pinNumber)
  }

  onKeyDownHandlerDiv = (e: Object) => {
    if (e.keyCode === KEY_CODE_TAB) {
      this.setState({
        isColorDivFocused: true
      })
    }

    const { isColorDivFocused } = this.state
    if (isColorDivFocused && (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE)) {
      e.stopPropagation()
      e.preventDefault()
      this.props.activatePin(this.props.pinNumber)
      this.focusHandler()
    } else if (isColorDivFocused &&
      this.props.isActiveFlag && (
      e.keyCode === KEY_CODE_ARROW_LEFT ||
      e.keyCode === KEY_CODE_ARROW_UP ||
      e.keyCode === KEY_CODE_ARROW_RIGHT ||
      e.keyCode === KEY_CODE_ARROW_DOWN)
    ) {
      e.stopPropagation()
      e.preventDefault()
      const pinPositionDocument = this.getElementsTopLeftCoordinates(e)
      let pinTopReferredToCanvas = parseInt(pinPositionDocument.top, 10) + activedPinsHalfWidth
      let pinLeftReferredToCanvas = parseInt(pinPositionDocument.left, 10) + activedPinsHalfWidth

      let movementInterval = PIN_MOVEMENT_INTERVAL

      if (e.shiftKey) {
        movementInterval = PIN_MOVEMENT_SHIFT_KEY_INTERVAL
      }

      switch (e.keyCode) {
        case KEY_CODE_ARROW_LEFT:
          pinLeftReferredToCanvas -= movementInterval
          break
        case KEY_CODE_ARROW_UP:
          pinTopReferredToCanvas -= movementInterval
          break
        case KEY_CODE_ARROW_RIGHT:
          pinLeftReferredToCanvas += movementInterval
          break
        case KEY_CODE_ARROW_DOWN:
          pinTopReferredToCanvas += movementInterval
          break
      }

      this.props.handlePinMoveByKeyboard({
        offsetX: pinLeftReferredToCanvas, offsetY: pinTopReferredToCanvas, pinNumber: this.props.pinNumber
      })
    }
  }

  focusHandler = () => {
    this.colorDivRef.current.focus()
    const { isColorDivFocused } = this.state
    if (isColorDivFocused) {
      this.colorDivRef.current.style.outlineStyle = 'solid'
      this.colorDivRef.current.style.outlineWidth = '2px'
      this.colorDivRef.current.style.outlineColor = '#2cabe2'
    }
  }

  handleKeyUpDiv = (e: Object) => {
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      this.focusHandler()
    } else if (this.props.isActiveFlag && (
      e.keyCode === KEY_CODE_ARROW_LEFT ||
      e.keyCode === KEY_CODE_ARROW_UP ||
      e.keyCode === KEY_CODE_ARROW_RIGHT ||
      e.keyCode === KEY_CODE_ARROW_DOWN
    )
    ) {
      this.props.handleKeyUpAfterPinMove(this.props.pinNumber)
    }
  }

  blurHandler = () => {
    this.colorDivRef.current.blur()
    this.colorDivRef.current.style.outline = 'none'
  }

  handleMouseDown = (e) => {
    this.setState({
      isColorDivFocused: false
    })
  }

  // get document coordinates of the element
  getElementsTopLeftCoordinates = (elem) => {
    let box = elem.target.getBoundingClientRect()
    return {
      top: box.top,
      left: box.left
    }
  }

  onChangeHandlerInput = (e: Object) => {
    this.props.activatePin(this.props.pinNumber)
  }

  handleMouseMove = (e) => {
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY
    this.props.handleDrag(x, y)
  }

  handleDragStart = (e: Object) => {
    e.stopPropagation()
    e.preventDefault()
    this.props.deleteCurrentPin(this.props.pinNumber)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleDragStop)
  }

  handleDragStop = (e) => {
    e.stopPropagation()
    this.props.handleDragStop(e)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleDragStop)
  }

  // 360 is subtracted to set the displayed pin to the labels origin. Despite the perfectness of the number its actually coincidental.
  render () {
    const { previewColorName, previewColorNumber, translateX, translateY, RGBstring, isActiveFlag, pinNumber, addColors, isContentLeft, hide } = this.props
    const { isColorDivFocused } = this.state
    const colorObject = getlpColorByNumber(previewColorNumber)
    const isColorAdded = some(addColors, colorObject)
    let transformValue = `translate(${translateX - 360}px, ${translateY}px)`
    return (
      <Fragment>
        <label
          title={`${previewColorName}`}
          aria-label={`${previewColorName}`}
          htmlFor={`${previewColorName}`}
          tabIndex='-1'
          onClick={this.onClickHandlerLabel}
          style={{ transform: transformValue, overflow: 'visible', display: (hide) ? 'none' : 'flex' }}
          className={`pin__wrapper ${isActiveFlag ? 'pin__wrapper--active' : ''}`}>
          <div className='pin__content__wrapper'>
            <div ref={this.colorDivRef} role='button' draggable
              tabIndex={'0'}
              onKeyDown={this.onKeyDownHandlerDiv}
              onKeyUp={this.handleKeyUpDiv}
              onFocus={this.focusHandler}
              onBlur={this.blurHandler}
              onMouseDown={this.handleMouseDown}
              onDragStart={this.handleDragStart} className={`pin__chip ${(isActiveFlag) ? `pin__chip--active` : ''}`} style={{ background: RGBstring }}>
              <input tabIndex='-1' className={CLASSES.CHECKBOX} type='checkbox' checked={isActiveFlag} name={`pin-${pinNumber}`} id={`pin-${pinNumber}`} onChange={this.onChangeHandlerInput} />
              {(isColorAdded && !isActiveFlag) ? (
                <FontAwesomeIcon style={{ color: getContrastYIQ(colorObject.hex) }} icon={['fa', 'check-circle']} size='1x' />
              ) : ''}
            </div>
            {
              <div className={`pin__content ${isContentLeft ? 'pin__content--left' : ''}`}>
                <div className={`pin__name__wrapper ${(isActiveFlag) ? `pin__name__wrapper--active` : `pin__name__wrapper--inactive`}`}>
                  <span className='pin__copy pin__number'>{(previewColorNumber) ? `SW${previewColorNumber}` : ''}</span>
                  <span className='pin__copy pin__name'>{previewColorName}</span>
                </div>
                <div className={`pin__wrapper__pin-add ${isContentLeft ? 'pin__wrapper__pin-add--left' : ''} ${(isActiveFlag) ? `pin__wrapper__pin-add--active` : ''}`} style={{ background: RGBstring }} >
                  <div className={`pin__wrapper__pin-add-icon ${isContentLeft ? 'pin__wrapper__pin-add-icon--left' : ''}`}>
                    {(isColorAdded) ? (
                      <FontAwesomeIcon style={{ color: getContrastYIQ(colorObject.hex) }} icon={['fa', 'check-circle']} size='2x' />
                    )
                      : (
                        <button tabIndex={(isActiveFlag) ? `0` : `-1`} className={`pin__wrapper__pin-add-button`} onClick={(e) => this.handleColorAdd(e, colorObject)}><FontAwesomeIcon tabIndex='-1' style={{ color: getContrastYIQ(colorObject.hex) }} icon={['fal', 'plus-circle']} size='2x' /></button>
                      )
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </label>
        {isActiveFlag && <LiveMessage message={`Color ${previewColorName} is active. Press tab to go to other color pins`} aria-live='polite' />}
        {isActiveFlag && isColorDivFocused && <LiveMessage message={`Use the arrow keys on your keyboard to move your picked color. Hold shift for fine movement.`} aria-live='assertive' clearOnUnmount='true' />}
      </Fragment>
    )
  }
}

const mapStateToProps = (state: Object, props: Object) => {
  const { lp } = state
  return {
    addColors: lp.colors
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addToLivePalette: (color) => {
      dispatch(add(color))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColorsFromImagePin)
