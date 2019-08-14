// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  rotateImage: Function,
  createColorPins: Function,
  imageData: Object
}
const ImageRotateTerms = ({ rotateImage, createColorPins, imageData }: Props) => {
  const [accetTerms, setAcceptTerms] = useState(false)
  function handleChange () {
    setAcceptTerms(!accetTerms)
  }
  return (
    <div className={`match-photo__image-rotate-terms-modal-wrapper`}>
      <div className={`match-photo__image-rotate-terms-modal-wrapper__container`}>
        <div className={`match-photo__image-rotate-terms-modal-wrapper__tools`}>
          <div className={`match-photo__image-rotate-terms-modal-wrapper__tools__message`}>
            Use these arrows to rotate your image.
          </div>
          <button className={`match-photo__image-rotate-terms-modal-wrapper__tools__rotate-arrow`} onClick={() => rotateImage(false)}><FontAwesomeIcon icon={['fal', 'undo']} size='xs' /></button>
          <button className={`match-photo__image-rotate-terms-modal-wrapper__tools__rotate-arrow`} onClick={() => rotateImage(true)}><FontAwesomeIcon icon={['fal', 'redo']} size='xs' /></button>
        </div>
        <div className={`match-photo__image-rotate-terms-modal-wrapper__agree-terms`}>
          <div>
            <span>
              <input type='checkbox' value='terms' checked={accetTerms} onChange={handleChange} /></span> <span className={`match-photo__image-rotate-terms-modal-wrapper__agree-terms__text`}>I accept Terms of Use</span>
          </div>
        </div>
        <button
          className={`match-photo__image-rotate-terms-modal-wrapper__agree-terms__accept ${accetTerms ? `match-photo__image-rotate-terms-modal-wrapper__agree-terms__accept--active` : ``}`}
          onClick={() => (accetTerms) ? createColorPins(imageData) : {}}>DONE</button>
      </div>
    </div>
  )
}

export default ImageRotateTerms
