// @flow
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PaletteSuggester from './ColorPickerSlideContainer'
import MoreDetailsCollapse from './MoreDetails'
import { faLongArrowRight, faLongArrowLeft } from '@fortawesome/pro-light-svg-icons'
import './ColorPickerSlide.scss'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import WithConfigurationContext from '../../contexts/ConfigurationContext/WithConfigurationContext'
import { loadColors } from '../../store/actions/loadColors'
import { loadCollectionSummaries } from '../../store/actions/collectionSummaries'

const baseClass = 'prism-color-picker'
const slideHeader = 'slide-palette-header'

type SummaryProps = {
  colors: number[],
  associatedColorCollection: Object,
  colorMap: Object,
  config: Object,
  intl: Object,
  loadColors: Function,
  loadCollectionSummaries: Function
}

function ColorPickerSlide (props: SummaryProps) {
  const { loadColors, loadCollectionSummaries, colors, associatedColorCollection, colorMap, config, intl } = props
  const [isShowSlider, handleSlideShow] = useState(false)

  const [dataLoaded, setDataLoaded] = useState(false)
  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true)
      loadCollectionSummaries()
      loadColors(config.brandId, { language: intl.locale })
    }
  })

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
            {!!Object.keys(colorMap).length && <PaletteSuggester expertColor={colors.map(id => colorMap[id])} isShowSlider={isShowSlider} handleSlideShow={() => { handleSlideShow(!isShowSlider) }} />}
          </div>
          <button className={`${slideHeader}__mobile-toggle-arrow ${isShowSlider ? `${slideHeader}__mobile-toggle-arrow--up` : ``}`} onClick={() => { handleSlideShow(!isShowSlider) }} />
        </div>
        {associatedColorCollection && <MoreDetailsCollapse isShowSlider={isShowSlider} associatedColorCollection={associatedColorCollection} />}
      </div>
    </React.Fragment>
  )
}

export {
  ColorPickerSlide
}

export default connect(
  (state, { associatedColorCollection }) => {
    const { data, idToIndexHash } = state.collectionSummaries.summaries
    const collection = data[idToIndexHash[associatedColorCollection]]
    return {
      colorMap: state.colors.items.colorMap || {},
      associatedColorCollection: collection
    }
  },
  { loadColors, loadCollectionSummaries }
)(injectIntl(WithConfigurationContext(ColorPickerSlide)))
