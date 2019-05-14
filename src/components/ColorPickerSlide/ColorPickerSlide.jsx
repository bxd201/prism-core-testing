// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PaletteSuggester from './ColorPickerSlideContainer'
import MoreDetailsCollapse from './MoreDetails'
import { faLongArrowRight, faLongArrowLeft } from '@fortawesome/pro-light-svg-icons'
import './ColorPickerSlide.scss'

const baseClass = 'prism-color-picker'
const slideHeader = 'slide-palette-header'

export function ColorPickerSlide () {
  const [isShowSlider, handleSlideShow] = useState(false)

  return (
    <div className={`${baseClass}__wrapper ${isShowSlider ? `${baseClass}__wrapper--show` : `${baseClass}__wrapper--hide`}`}>
      <div className={`${baseClass}__wrapper__border`}>
        <div className={`${slideHeader} ${isShowSlider ? `${slideHeader}--show` : `${slideHeader}--hide`}`}>
          {isShowSlider && <span>Expert Color Picks</span>}
          <button className={`${slideHeader}__arrow-button`} onClick={() => { handleSlideShow(!isShowSlider) }}>
            {isShowSlider && <FontAwesomeIcon className={`${baseClass}__toggle-arrow`} icon={faLongArrowRight} />}
            {!isShowSlider && <FontAwesomeIcon className={`${baseClass}__toggle-arrow`} icon={faLongArrowLeft} />}
          </button>
        </div>
        <div className='slide-palette-content'>
          <PaletteSuggester isShowSlider={isShowSlider} handleSlideShow={() => { handleSlideShow(!isShowSlider) }} />
        </div>
      </div>
      <MoreDetailsCollapse isShowSlider={isShowSlider} />
    </div>
  )
}
