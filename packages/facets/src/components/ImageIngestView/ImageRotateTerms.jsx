/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React, { useState, useRef, useEffect, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CircleLoader } from '@prism/toolkit'
import 'src/providers/fontawesome/fontawesome'
import { FormattedMessage, useIntl } from 'react-intl'
import 'src/scss/convenience/visually-hidden.scss'
import { KEY_CODES } from 'src/constants/globals'
import ConfigurationContext, { type ConfigurationContextType } from 'src/contexts/ConfigurationContext/ConfigurationContext'

import './ImageRotateTerms.scss'

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
  imageData: Object,
  handleDismiss: Function
}

const ImageRotateTerms = ({ rotateImage, imageData, handleDismiss }: Props) => {
  const [acceptTerms, setAcceptTerms] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [hideModal, setHideModal] = useState(false)
  let mouseDown = false
  const btnRef = useRef()
  const intl = useIntl()
  const { cvw: { termsOfUseLink = 'https://www.sherwin-williams.com/terms-of-use' } }: ConfigurationContextType = useContext(ConfigurationContext)

  useEffect(() => {
    btnRef.current.focus()
  }, [])

  function handleChange () {
    setAcceptTerms(!acceptTerms)
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

  return (
    <div className={`${wrapperClass}`}>
      <div className={`${wrapperContainerClass} ${hideModal ? `${wrapperContainerInactiveClass}` : ``}`}>
        <div className={`${wrapperToolsClass}`}>
          <div className={`${wrapperToolsMessageClass}`}>
            <FormattedMessage id='PREVIEW_ROTATE_SCALE' />
          </div>
          <button
            aria-label='rotate image 90 degree anticlockwise'
            ref={btnRef}
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onFocus={focusHandler}
            className={`${wrapperToolsRotateArrowClass}`} onClick={() => rotateImage(false)}><FontAwesomeIcon icon={['fal', 'undo']} size='xs' /></button>
          <button
            aria-label='rotate image 90 degree clockwise'
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onFocus={focusHandler}
            className={`${wrapperToolsRotateArrowClass}`} onClick={() => rotateImage(true)}><FontAwesomeIcon icon={['fal', 'redo']} size='xs' /></button>
        </div>
        <div className={`${wrapperAgreeTermsClass}`}>
          <div>
            <span>
              <label
                aria-label={intl.formatMessage({ id: 'ACCEPT_TERM' })}
                onMouseDown={mouseDownHandler}
                onMouseUp={mouseUpHandler}
                onFocus={focusHandler}
                onKeyDown={keyDownHandler}
                tabIndex='0' className={`${wrapperAgreeTermsCheckboxLabelClass}`}>
                {
                  (acceptTerms) ? <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: '#2cabe1' }} size='lg' />
                    : <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: '#e5e5e5' }} size='lg' />
                }
                <input tabIndex='-1' className='visually-hidden' type='checkbox' value='terms' checked={acceptTerms} onChange={handleChange} />
              </label>
            </span>
            <span className={`${wrapperAgreeTermsTextClass}`}>
              <FormattedMessage id='I_ACCEPT' /> <a href={termsOfUseLink} target='_blank'><FormattedMessage id='TERMS_OF_USE' /></a>
            </span>
          </div>
        </div>
        <button
          disabled={!acceptTerms}
          aria-label={acceptTerms ? 'done' : ''}
          tabIndex={acceptTerms ? '0' : '-1'}
          className={`${wrapperAgreeTermsAcceptClass} ${acceptTerms ? `${wrapperAgreeTermsAcceptActiveClass}` : ``}`}
          onClick={handleDismiss}><FormattedMessage id='DONE' /></button>
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
