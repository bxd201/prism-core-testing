// @flow
import React, { useState, useEffect, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'src/providers/fontawesome/fontawesome'
import PaletteSuggester from './ColorPickerSlideContainer'
import MoreDetailsCollapse from './MoreDetails'
import './ColorPickerSlide.scss'
import { useSelector, useDispatch } from 'react-redux'
import ConfigurationContext from 'src/contexts/ConfigurationContext/ConfigurationContext'
import { loadColors } from '../../store/actions/loadColors'
import { loadCollectionSummaries } from '../../store/actions/collectionSummaries'

const baseClass = 'prism-color-picker'
const slideHeader = 'slide-palette-header'

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
  const dispatch = useDispatch()
  const [isShowSlider, handleSlideShow] = useState(false)

  useEffect(() => {
    dispatch(loadCollectionSummaries())
    dispatch(loadColors(brandId))
  }, [])

  return (
    <React.Fragment>
      <div className={`${baseClass}__wrapper ${isShowSlider ? `${baseClass}__wrapper--show` : `${baseClass}__wrapper--hide`}`}>
        <div className={`${baseClass}__wrapper__border`}>
          <div className={`${slideHeader} ${isShowSlider ? `${slideHeader}--show` : `${slideHeader}--hide`}`}>
            {isShowSlider && <span>Expert Color Picks</span>}
            <button className={`${slideHeader}__arrow-button`} onClick={() => { handleSlideShow(!isShowSlider) }}>
              {isShowSlider && <FontAwesomeIcon className={`${baseClass}__toggle-arrow`} icon={['fal', 'long-arrow-right']} />}
              {!isShowSlider && <FontAwesomeIcon className={`${baseClass}__toggle-arrow`} icon={['fal', 'long-arrow-left']} />}
            </button>
          </div>
          <div className='slide-palette-content'>
            {!!Object.keys(colorMap).length &&
              <PaletteSuggester
                expertColor={expertColorPicks.map(id => colorMap[id])}
                isShowSlider={isShowSlider}
                handleSlideShow={() => { handleSlideShow(!isShowSlider) }}
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
