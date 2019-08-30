// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'

const baseClass = 'image-rotate-terms-modal'
const wrapperClass = `${baseClass}__wrapper`
const wrapperContainerClass = `${wrapperClass}__container`
const wrapperContainerInactiveClass = `${wrapperContainerClass}--inactive`
const wrapperToolsClass = `${wrapperClass}__tools`
const wrapperToolsMessageClass = `${wrapperToolsClass}__message`
const wrapperToolsRotateArrowClass = `${wrapperToolsClass}__rotate-arrow`
const wrapperAgreeTermsClass = `${wrapperClass}__agree-terms`
const wrapperAgreeTermsCheckboxLabelClass = `${wrapperAgreeTermsClass}__checkbox-label`
const wrapperAgreeTermsTextClass = `${wrapperAgreeTermsClass}__text`
const wrapperAgreeTermsAcceptClass = `${wrapperAgreeTermsClass}__accept`
const wrapperAgreeTermsAcceptActiveClass = `${wrapperAgreeTermsAcceptClass}--active`
const wrapperLoaderClass = `${wrapperClass}__loader`

type Props = {
  rotateImage: Function,
  createColorPins: Function,
  imageData: Object
}

const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

const ImageRotateTerms = ({ rotateImage, createColorPins, imageData }: Props) => {
  const [accetTerms, setAcceptTerms] = useState(false)
  const [hideModal, setHideModal] = useState(false)
  let mouseDown = false

  function handleChange () {
    setAcceptTerms(!accetTerms)
  }

  function mouseDownHandler () {
    mouseDown = true
  }

  function mouseUpHandler () {
    setTimeout(() => {
      mouseDown = false
    }, 200)
  }

  function focusHandler (e: Object) {
    if (mouseDown) {
      e.target.blur()
    }
  }

  function keyDownHandler (e: KeyboardEvent) {
    if (e.keyCode && (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE)) {
      e.preventDefault()
      handleChange()
    }
  }

  function clickHandler () {
    setHideModal(true)
    createColorPins(imageData)
  }

  return (
    <div className={`${wrapperClass}`}>
      <div className={`${wrapperContainerClass} ${hideModal ? `${wrapperContainerInactiveClass}` : ``}`}>
        <div className={`${wrapperToolsClass}`}>
          <div className={`${wrapperToolsMessageClass}`}>
            Use these arrows to rotate your image.
          </div>
          <button
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onFocus={focusHandler}
            className={`${wrapperToolsRotateArrowClass}`} onClick={() => rotateImage(false)}><FontAwesomeIcon icon={['fal', 'undo']} size='xs' /></button>
          <button
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onFocus={focusHandler}
            className={`${wrapperToolsRotateArrowClass}`} onClick={() => rotateImage(true)}><FontAwesomeIcon icon={['fal', 'redo']} size='xs' /></button>
        </div>
        <div className={`${wrapperAgreeTermsClass}`}>
          <div>
            <span>
              <label
                onMouseDown={mouseDownHandler}
                onMouseUp={mouseUpHandler}
                onFocus={focusHandler}
                onKeyDown={keyDownHandler}
                tabIndex='0' className={`${wrapperAgreeTermsCheckboxLabelClass}`}>
                {
                  (accetTerms) ? <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: '#2cabe1' }} size='lg' />
                    : <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: '#e5e5e5' }} size='lg' />
                }
                <input tabIndex='-1' className='visually-hidden' type='checkbox' value='terms' checked={accetTerms} onChange={handleChange} />
              </label>
            </span> <span className={`${wrapperAgreeTermsTextClass}`}>I accept Terms of Use</span>
          </div>
        </div>
        <button
          className={`${wrapperAgreeTermsAcceptClass} ${accetTerms ? `${wrapperAgreeTermsAcceptActiveClass}` : ``}`}
          onClick={() => (accetTerms) ? clickHandler() : {}}>DONE</button>
      </div>
      { hideModal && <div className={`${wrapperLoaderClass}`}><CircleLoader /></div> }
    </div>
  )
}

export {
  wrapperToolsMessageClass,
  wrapperToolsRotateArrowClass,
  wrapperAgreeTermsAcceptClass,
  wrapperAgreeTermsCheckboxLabelClass,
  wrapperAgreeTermsTextClass,
  wrapperAgreeTermsAcceptActiveClass
}
export default ImageRotateTerms
