// @flow
import React, { useState, useEffect, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import PaletteSuggester from './ColorPickerSlideContainer'
import MoreDetailsCollapse from './MoreDetails'
import './ColorPickerSlide.scss'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../store/actions/loadColors'
import { loadCollectionSummaries } from '../../store/actions/collectionSummaries'

const baseClass = 'prism-color-picker'
const slideHeader = 'slide-palette-header'

const KEY_CODE_ENTER = 13
const KEY_CODE_SPACE = 32

const ariaLabelToggleButton = 'Toggle Expert Picks'

type SummaryProps = {
  expertColorPicks: number[],
  associatedColorCollection: Object
}

function ColorPickerSlide (props: SummaryProps) {
  const { expertColorPicks, associatedColorCollection } = props
  const { colorMap, colorCollection } = useSelector(state => {
    const { data, idToIndexHash } = state.collectionSummaries.summaries
    return {
      colorMap: state.colors.items.colorMap || {},
      colorCollection: data[idToIndexHash[associatedColorCollection]]
    }
  })
  const { brandId } = useContext(ConfigurationContext)
  const { locale } = useIntl()
  const dispatch = useDispatch()
  const [isShowSlider, handleSlideShow] = useState(false)
  const wrapperRef = React.useRef()

  useEffect(() => {
    dispatch(loadCollectionSummaries())
    dispatch(loadColors(brandId, { language: locale }))
  }, [])

  const divKeyDownHandler = (e) => {
    e.stopPropagation()
    if (e.keyCode === KEY_CODE_ENTER || e.keyCode === KEY_CODE_SPACE) {
      if (!isShowSlider) {
        handleSlideShow(!isShowSlider)
        wrapperRef.current.style.outlineStyle = 'none'
      }
    }
  }

  const divFocusHandler = () => {
    if (!isShowSlider) {
      wrapperRef.current.style.outlineStyle = 'solid'
      wrapperRef.current.style.outlineWidth = '2px'
      wrapperRef.current.style.outlineColor = '#2cabe2'
    }
  }

  const divBlurHandler = () => {
    wrapperRef.current.style.outlineStyle = 'none'
  }

  const handleSlideShowWrapper = () => {
    handleSlideShow(!isShowSlider)
  }

  return (
    <React.Fragment>
      <div ref={wrapperRef} className={`${baseClass}__wrapper ${isShowSlider ? `${baseClass}__wrapper--show` : `${baseClass}__wrapper--hide`}`}>
        <div className={`${slideHeader} ${isShowSlider ? `${slideHeader}--show` : `${slideHeader}--hide`}`}>
          {isShowSlider && <span>Expert Color Picks</span>}
          <button aria-label={`${ariaLabelToggleButton}`} aria-expanded={isShowSlider} className={`${slideHeader}__arrow-button`} onMouseDown={(e) => e.preventDefault()} onClick={() => { handleSlideShow(!isShowSlider) }}>
            {isShowSlider && <FontAwesomeIcon className={`${baseClass}__toggle-arrow`} icon={['fal', 'long-arrow-right']} />}
            {!isShowSlider && <FontAwesomeIcon className={`${baseClass}__toggle-arrow`} icon={['fal', 'long-arrow-left']} />}
          </button>
        </div>
        <div onFocus={divFocusHandler} onBlur={divBlurHandler} onKeyDown={divKeyDownHandler} tabIndex={(!isShowSlider) ? '0' : '-1'} role='presentation' className={`${baseClass}__wrapper__border`}>
          <div className='slide-palette-content'>
            {!!Object.keys(colorMap).length &&
              <PaletteSuggester
                expertColor={expertColorPicks.map(id => colorMap[id])}
                isShowSlider={isShowSlider}
                handleSlideShow={handleSlideShowWrapper}
              />}
          </div>
          <button className={`${slideHeader}__mobile-toggle-arrow ${isShowSlider ? `${slideHeader}__mobile-toggle-arrow--up` : ``}`} onClick={() => { handleSlideShow(!isShowSlider) }} />
        </div>
        {colorCollection && <MoreDetailsCollapse isShowSlider={isShowSlider} associatedColorCollection={colorCollection} />}
      </div>
    </React.Fragment>
  )
}

export {
  ColorPickerSlide
}

export default ColorPickerSlide
