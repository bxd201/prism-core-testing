// @flow
import type { Node } from 'react'
import React, { useContext, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ConfigurationContext, {
  type ConfigurationContextType
} from 'src/contexts/ConfigurationContext/ConfigurationContext'
import useCompareColor from 'src/hooks/useCompareColor'
import 'src/providers/fontawesome/fontawesome'
import {
  ANALYTICS_EVENTS,
  ANALYTICS_INTERACTIONS_TYPE,
  createGTMData,
  pushToDataLayer
} from '../../analytics/analyticsUtils'
import type { Color } from '../../shared/types/Colors.js.flow'
import type { FlatScene, FlatVariant } from '../../shared/types/Scene'
import { getVariantDescription } from '../../shared/utils/tintableSceneUtils'
import CompareColorSlider from './CompareColorSlider'
import * as style from './constants'
import './CompareColor.scss'

type CompareColorProps = {
  colorIds: string[],
  colors: Color[],
  scenesCollection: FlatScene[],
  selectedSceneUid: string,
  selectedVariantName: string,
  toggleCompareColor: () => void,
  variantsCollection: FlatVariant[]
}

type CompareColorState = {
  colorIds: string[],
  colors: Color[],
  renderColors: Color[]
}

const CompareColor = ({
  colorIds,
  colors,
  scenesCollection,
  selectedSceneUid,
  selectedVariantName,
  toggleCompareColor,
  variantsCollection
}: CompareColorProps): Node => {
  const { carousel, setCarousel, setPointer, handleNext, handlePrev, updateSlideButtons } = useCompareColor({
    colorIds,
    colors
  })

  const {
    colorWall: { colorSwatch = {} },
    cvw = {},
    allowedAnalytics
  }: ConfigurationContextType = useContext(ConfigurationContext)
  const { colorNumOnBottom = false, houseShaped = false } = colorSwatch
  const { closeBtn = {} } = cvw
  const { showArrow: closeBtnShowArrow = true, text: closeBtnText = <FormattedMessage id='CLOSE' /> } = closeBtn
  const colorInfoClass = houseShaped ? `${style.baseClass}-house-shaped` : `${style.baseClass}__color__info`

  // this fires GTM event when this mounts, we do it here to have access to the scene data
  useEffect(() => {
    pushToDataLayer(
      createGTMData(
        ANALYTICS_EVENTS.INTERACTION,
        ANALYTICS_INTERACTIONS_TYPE.BUTTON,
        getVariantDescription(selectedSceneUid, selectedVariantName, scenesCollection, variantsCollection),
        'compare colors'
      ),
      allowedAnalytics
    )
  }, [])

  useEffect(() => {
    if (!colors.length) {
      toggleCompareColor()
      return undefined
    }

    setPointer()
  }, [colors])

  useEffect(() => {
    updateSlideButtons()
  }, [carousel.pointer])

  return (
    <div className={`${style.containerClass}`}>
      <div className={`${style.containerHeaderClass}`}>
        <span>
          <FormattedMessage id='COMPARE_COLORS' />
        </span>
        <button className={`text-xs ${style.containerHeaderButtonClass}`} onClick={toggleCompareColor}>
          {closeBtnText ?? <FormattedMessage id='CLOSE' />}
          {closeBtnShowArrow && (
            <FontAwesomeIcon className={`${style.containerHeaderClass}--icon`} icon={['fa', 'chevron-up']} />
          )}
        </button>
      </div>
      <div className={`${style.wrapperClass}`}>
        <div className={`${style.prevBtnWrapperClass}`}>
          {
            <button
              className={`${style.buttonsClass} ${carousel.isHidePrevButton ? `${style.buttonsVisibleClass}` : ''}`}
              onClick={handlePrev}
            >
              <FontAwesomeIcon icon={houseShaped ? ['far', 'long-arrow-left'] : ['fa', 'chevron-left']} />
            </button>
          }
        </div>
        <CompareColorSlider
          colorIds={colorIds}
          colorInfoClass={colorInfoClass}
          colorNumOnBottom={colorNumOnBottom}
          colors={colors}
          curr={carousel.pointer}
          scenesCollection={scenesCollection}
          selectedSceneUid={selectedSceneUid}
          selectedVariantName={selectedVariantName}
          variantsCollection={variantsCollection}
        />
        <div className={`${style.nextBtnWrapperClass}`}>
          {
            <button
              className={`${style.buttonsClass} ${carousel.isHideNextButton ? `${style.buttonsVisibleClass}` : ''}`}
              onClick={handleNext}
            >
              <FontAwesomeIcon icon={houseShaped ? ['far', 'long-arrow-right'] : ['fa', 'chevron-right']} />
            </button>
          }
        </div>
      </div>
    </div>
  )
}

export default CompareColor
