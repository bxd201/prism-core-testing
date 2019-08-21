// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CircleLoader from '../Loaders/CircleLoader/CircleLoader'

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
    <div className={`image-rotate-terms-modal__wrapper`}>
      <div className={`image-rotate-terms-modal__wrapper__container ${hideModal ? `image-rotate-terms-modal__wrapper__container--inactive` : ``}`}>
        <div className={`image-rotate-terms-modal__wrapper__tools`}>
          <div className={`image-rotate-terms-modal__wrapper__tools__message`}>
            Use these arrows to rotate your image.
          </div>
          <button
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onFocus={focusHandler}
            className={`image-rotate-terms-modal__wrapper__tools__rotate-arrow`} onClick={() => rotateImage(false)}><FontAwesomeIcon icon={['fal', 'undo']} size='xs' /></button>
          <button
            onMouseDown={mouseDownHandler}
            onMouseUp={mouseUpHandler}
            onFocus={focusHandler}
            className={`image-rotate-terms-modal__wrapper__tools__rotate-arrow`} onClick={() => rotateImage(true)}><FontAwesomeIcon icon={['fal', 'redo']} size='xs' /></button>
        </div>
        <div className={`image-rotate-terms-modal__wrapper__agree-terms`}>
          <div>
            <span>
              <label
                onMouseDown={mouseDownHandler}
                onMouseUp={mouseUpHandler}
                onFocus={focusHandler}
                onKeyDown={keyDownHandler}
                tabIndex='0' className={`image-rotate-terms-modal__wrapper__agree-terms__checkbox-label`}>
                {
                  (accetTerms) ? <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: '#2cabe1' }} size='lg' />
                    : <FontAwesomeIcon icon={['fa', 'dot-circle']} style={{ color: '#e5e5e5' }} size='lg' />
                }
                <input tabIndex='-1' className='visually-hidden' type='checkbox' value='terms' checked={accetTerms} onChange={handleChange} />
              </label>
            </span> <span className={`image-rotate-terms-modal__wrapper__agree-terms__text`}>I accept Terms of Use</span>
          </div>
        </div>
        <button
          className={`image-rotate-terms-modal__wrapper__agree-terms__accept ${accetTerms ? `image-rotate-terms-modal__wrapper__agree-terms__accept--active` : ``}`}
          onClick={() => (accetTerms) ? clickHandler() : {}}>DONE</button>
      </div>
      { hideModal && <div className={`image-rotate-terms-modal__wrapper__loader`}><CircleLoader /></div> }
    </div>
  )
}

export default ImageRotateTerms
