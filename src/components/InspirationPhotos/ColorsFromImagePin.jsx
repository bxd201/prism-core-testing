// @flow
import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { add } from '../../store/actions/live-palette'
import type { Color } from 'src/shared/types/Colors.js.flow'
import { LiveMessage } from 'react-aria-live'
import { activedPinsHalfWidth } from './data'
import { getContrastYIQ } from '../../../src/shared/helpers/ColorUtils'
import { KEY_CODES } from 'src/constants/globals'
import './ColorPins.scss'
import 'src/scss/convenience/visually-hidden.scss'
import 'src/providers/fontawesome/fontawesome'

type Props = {
  color: {
    ...Color,
    isActiveFlag: boolean,
    isContentLeft: boolean,
    translateX: number,
    translateY: number,
    rgbValue: string,
    pinNumber: number,
    isMovingPin: boolean,
    hide: boolean,
    pinId: string
  },
  useTranslateProps: boolean,
  translateX: number,
  translateY: number,
  activatePin: Function,
  handleDrag: Function,
  deleteCurrentPin: Function,
  handleDragStop: Function,
  handlePinMoveByKeyboard: Function,
  handleKeyUpAfterPinMove: Function,
  handleTouchEnd: Function
}

export const CLASSES = { BASE: 'pin__wrapper', CHECKBOX: 'visually-hidden' }

const PIN_MOVEMENT_INTERVAL = 10
const PIN_MOVEMENT_SHIFT_KEY_INTERVAL = 1

export default (props: Props) => {
  const { color, activatePin, handlePinMoveByKeyboard, handleKeyUpAfterPinMove, deleteCurrentPin, handleDrag, handleDragStop, handleTouchEnd } = props

  const dispatch = useDispatch()
  const { formatMessage } = useIntl()
  const livePaletteColors = useSelector(store => store.lp.colors)
  const colorDivRef: { current?: HTMLDivElement } = useRef()
  const [isColorDivFocused: boolean, setIsColorDivFocused: boolean => void] = useState()
  const isColorAdded = livePaletteColors.some(paletteColor => paletteColor.colorNumber === color.colorNumber)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    setIsHidden(color.hide)
  }, [color])

  const focusHandler = () => {
    colorDivRef.current && colorDivRef.current.focus()
    if (isColorDivFocused && colorDivRef.current) {
      colorDivRef.current.style.outlineStyle = 'solid'
      colorDivRef.current.style.outlineWidth = '2px'
      colorDivRef.current.style.outlineColor = '#2cabe2'
    }
  }

  const getElementsTopLeftCoordinates = (elem) => {
    const { top, left } = elem.target.getBoundingClientRect()
    return { top, left }
  }

  const onKeyDownHandlerDiv = (e) => {
    e.keyCode === KEY_CODES.KEY_CODE_TAB && setIsColorDivFocused(true)

    if (isColorDivFocused && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE)) {
      e.stopPropagation()
      e.preventDefault()
      activatePin(color.pinNumber)
      focusHandler()
    } else if (isColorDivFocused &&
      color.isActiveFlag && (
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_LEFT ||
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_UP ||
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_RIGHT ||
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_DOWN)
    ) {
      e.stopPropagation()
      e.preventDefault()
      const pinPositionDocument = getElementsTopLeftCoordinates(e)
      const movementInterval = e.shiftKey ? PIN_MOVEMENT_SHIFT_KEY_INTERVAL : PIN_MOVEMENT_INTERVAL
      let pinTopReferredToCanvas = Math.floor(pinPositionDocument.top) + activedPinsHalfWidth
      let pinLeftReferredToCanvas = Math.floor(pinPositionDocument.left) + activedPinsHalfWidth

      switch (e.keyCode) {
        case KEY_CODES.KEY_CODE_ARROW_LEFT:
          pinLeftReferredToCanvas -= movementInterval
          break
        case KEY_CODES.KEY_CODE_ARROW_UP:
          pinTopReferredToCanvas -= movementInterval
          break
        case KEY_CODES.KEY_CODE_ARROW_RIGHT:
          pinLeftReferredToCanvas += movementInterval
          break
        case KEY_CODES.KEY_CODE_ARROW_DOWN:
          pinTopReferredToCanvas += movementInterval
          break
      }

      handlePinMoveByKeyboard({ offsetX: pinLeftReferredToCanvas, offsetY: pinTopReferredToCanvas, pinNumber: color.pinNumber })
    }
  }

  const handleKeyUpDiv = (e) => {
    if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) {
      focusHandler()
    } else if (color.isActiveFlag && (
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_LEFT ||
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_UP ||
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_RIGHT ||
      e.keyCode === KEY_CODES.KEY_CODE_ARROW_DOWN
    )) {
      handleKeyUpAfterPinMove(color.pinNumber)
    }
  }

  const handleMouseMove = (e: SyntheticEvent, isMobile: booleam = false) => {
    if (e.target) {
      e.stopPropagation()
    }

    handleDrag(e.clientX, e.clientY, isMobile)
  }

  const handlePinDragStop = (e: SyntheticEvent) => {
    e.stopPropagation()
    handleDragStop(e)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handlePinDragStop)
  }

  const handlePinDragStart = (e) => {
    deleteCurrentPin(color.pinNumber)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handlePinDragStop)
  }

  const handleTouchStart = (e: SyntheticEvent) => {
    setIsColorDivFocused(false)
    setIsHidden(true)
  }

  const handleTouchStop = (e: SyntheticEvent) => {
    const dims = colorDivRef.current.getBoundingClientRect()
    handleTouchEnd(dims, color.pinId)
  }

  const handleTouchMove = (e: SyntheticEvent) => {
    // @todo this gets drag working on mobile but color is off, this is index math issue.  I should build a translator...
    handleMouseMove({ clientX: e.targetTouches[0].clientX, clientY: e.targetTouches[0].clientY }, true)
  }

  const translateX = props.useTranslateProps ? props.translateX : color.translateX
  const translateY = props.useTranslateProps ? props.translateY : color.translateY
  return (
    <>
      <label
        title={color.name}
        aria-label={color.name}
        htmlFor={color.name}
        tabIndex='-1'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          activatePin(color.pinNumber)
        }}
        style={{ transform: `translate(${translateX - 360}px, ${translateY}px)`, overflow: 'visible', display: isHidden ? 'none' : 'flex' }}
        className={`pin__wrapper ${color.isActiveFlag ? 'pin__wrapper--active' : ''}`}
      >
        <div className='pin__content__wrapper'>
          <div
            ref={colorDivRef}
            role='button'
            draggable
            tabIndex='0'
            onKeyDown={onKeyDownHandlerDiv}
            onKeyUp={handleKeyUpDiv}
            onFocus={focusHandler}
            onBlur={() => {
              colorDivRef.current.blur()
              colorDivRef.current.style.outline = 'none'
            }}
            onMouseDown={() => setIsColorDivFocused(false)}
            onDragStart={handlePinDragStart}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchStop}
            className={`pin__chip ${(color.isActiveFlag) ? `pin__chip--active` : ''}`}
            style={{ background: color.rgbValue }}
          >
            <input
              tabIndex='-1'
              className={CLASSES.CHECKBOX}
              type='checkbox'
              checked={color.isActiveFlag}
              name={`pin-${color.pinNumber}`}
              id={`pin-${color.pinNumber}`}
              onChange={() => activatePin(color.pinNumber)}
            />
            {(isColorAdded && !color.isActiveFlag) && (<FontAwesomeIcon style={{ color: getContrastYIQ(color.hex) }} icon={['fa', 'check-circle']} size='1x' />)}
          </div>
          <div className={`pin__content ${color.isContentLeft ? 'pin__content--left' : ''}`}>
            <div className={`pin__name__wrapper ${color.isActiveFlag ? `pin__name__wrapper--active` : `pin__name__wrapper--inactive`}`}>
              <span className='pin__copy pin__number'>{(color.colorNumber) ? `${color.brandKey}${color.colorNumber}` : ''}</span>
              <span className='pin__copy pin__name'>{color.name}</span>
            </div>
            <div
              className={`pin__wrapper__pin-add ${color.isContentLeft ? 'pin__wrapper__pin-add--left' : ''} ${color.isActiveFlag ? `pin__wrapper__pin-add--active` : ''}`}
              style={{ background: color.rgbValue }}
            >
              <div className={`pin__wrapper__pin-add-icon ${color.isContentLeft ? 'pin__wrapper__pin-add-icon--left' : ''}`}>
                {(isColorAdded)
                  ? (<FontAwesomeIcon style={{ color: getContrastYIQ(color.hex) }} icon={['fa', 'check-circle']} size='2x' />)
                  : (
                    <button
                      tabIndex={(color.isActiveFlag) ? `0` : `-1`}
                      className={`pin__wrapper__pin-add-button`}
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch(add(color))
                      }}
                    >
                      <FontAwesomeIcon tabIndex='-1' style={{ color: getContrastYIQ(color.hex) }} icon={['fal', 'plus-circle']} size='2x' />
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </label>
      {color.isActiveFlag && <LiveMessage message={formatMessage({ id: 'LIVE_MESSAGE_COLOR_NAME' }, { previewColorName: color.colorName })} aria-live='polite' />}
      {color.isActiveFlag && isColorDivFocused && <LiveMessage message={formatMessage({ id: 'LIVE_MESSAGE_MOVE_PIN' })} aria-live='assertive' clearOnUnmount='true' />}
    </>
  )
}
