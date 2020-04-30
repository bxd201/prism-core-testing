/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'
import { FormattedMessage } from 'react-intl'
import 'src/scss/convenience/visually-hidden.scss'
import { KEY_CODES } from 'src/constants/globals'

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

const ImageRotateTerms = ({ rotateImage, createColorPins, imageData }: Props) => {
  const [accetTerms, setAcceptTerms] = useState(false)
  const [hideModal, setHideModal] = useState(false)
  let mouseDown = false
  const btnRef = useRef()

  useEffect(() => {
    btnRef.current.focus()
  }, [])

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
    if (e.keyCode && (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE)) {
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
            <FormattedMessage id='PREVIEW_ROTATE_SCALE' />
          </div>
          <button
            ref={btnRef}
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
            </span> <span className={`${wrapperAgreeTermsTextClass}`}><FormattedMessage id='I_ACCEPT' /> <FormattedMessage id='TERMS_OF_USE' /></span>
          </div>
        </div>
        <button
          tabIndex={accetTerms ? '0' : '-1'}
          className={`${wrapperAgreeTermsAcceptClass} ${accetTerms ? `${wrapperAgreeTermsAcceptActiveClass}` : ``}`}
          onClick={() => (accetTerms) ? clickHandler() : {}}><FormattedMessage id='DONE' /></button>
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
