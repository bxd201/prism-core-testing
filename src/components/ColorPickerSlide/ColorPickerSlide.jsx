// @flow
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PaletteSuggester from './ColorPickerSlideContainer'
import MoreDetailsCollapse from './MoreDetails'
import { faLongArrowRight, faLongArrowLeft } from '@fortawesome/pro-light-svg-icons'
import './ColorPickerSlide.scss'
import { ExpertColor as expertColor } from './ExpertColor'
import { fullColorNumber } from '../../../src/shared/helpers/ColorUtils'

const baseClass = 'prism-color-picker'
const slideHeader = 'slide-palette-header'
const paletteSuggesterDetails = 'slide-palette-details'

function ColorPickerSlide () {
  const [isShowSlider, handleSlideShow] = useState(false)

  return (
    <React.Fragment>
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
            <PaletteSuggester expertColor={expertColor} isShowSlider={isShowSlider} handleSlideShow={() => { handleSlideShow(!isShowSlider) }} />
          </div>
          <button className={`${slideHeader}__mobile-toggle-arrow ${isShowSlider ? `${slideHeader}__mobile-toggle-arrow--up` : ``}`} onClick={() => { handleSlideShow(!isShowSlider) }} />
        </div>
        <MoreDetailsCollapse isShowSlider={isShowSlider} />
      </div>
      {isShowSlider && <div className={`${paletteSuggesterDetails}__wrapper`}>
        <div className={`${paletteSuggesterDetails}__wrapper__left`}>
          { expertColor.map((color, id) => {
            return (
              <div className={`${paletteSuggesterDetails}__container`} key={`${color.colorNumber}-${id}`}>
                <div className={`${paletteSuggesterDetails}__container__color`} style={{ backgroundColor: color.hex }}>&nbsp;</div>
                <div className={`${paletteSuggesterDetails}__container__color-details`}>
                  <div>
                    {fullColorNumber(color.brandKey, color.colorNumber)}
                  </div>
                  <div>
                    {color.name}
                  </div>
                </div>
              </div>
            )
          })
          }
        </div>
        <div className={`${paletteSuggesterDetails}__wrapper__right`}>
          <div>
            <div>Selected from 2016 <br /> Pura Vida </div>
            <div>
            VIEW FULL COLLECTION
            </div>
          </div>
        </div>
      </div>}
    </React.Fragment>
  )
}

export {
  ColorPickerSlide
}
export default ColorPickerSlide
