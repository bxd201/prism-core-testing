// @flow
import React, { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ExpertColorDetails from './ExpertColorDetails'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import Carousel from '../Carousel/Carousel'
import { loadExpertColorPicks } from 'src/store/actions/expertColorPicks'
import { fullColorNumber, getContrastYIQ } from 'src/shared/helpers/ColorUtils'
import './ExpertColorPicks.scss'
import { useIntl } from 'react-intl'
import at from 'lodash/at'
import { KEY_CODES } from 'src/constants/globals'

const ExpertColorPicks = () => {
  const dispatch = useDispatch()
  React.useEffect(() => { loadExpertColorPicks(dispatch) }, [])

  const { messages = {} } = useIntl()
  const expertColorPicks = useSelector(state => state.expertColorPicks.data)

  return (
    <CardMenu menuTitle={at(messages, 'EXPERT_COLOR_PICKS')[0]}>
      {(setCardShowing) => (
        <div className='expert-color-picks__wrapper'>
          <div className='expert-color-picks__collections-list'>
            {expertColorPicks.length > 0 && <Carousel
              BaseComponent={ColorStripButtonWrapper}
              defaultItemsPerView={8}
              isInfinity={false}
              key='expertcolorpicks'
              data={expertColorPicks}
              getSummaryData={collectionSummaryData => setCardShowing(<ExpertColorDetails expertColors={collectionSummaryData} />)}
            />}
          </div>
        </div>
      )}
    </CardMenu>
  )
}

const ColorStripButtonWrapper = (props: any) => {
  const { data, getSummaryData, handlePrev, handleNext, itemNumber, itemsPerView, totalItems } = props
  const clickHandler = useCallback(() => getSummaryData(data), [data])
  const color = data.colorDefs[0]

  const keyDownHandler = useCallback((e) => {
    if (e.shiftKey && e.keyCode === KEY_CODES.KEY_CODE_TAB) {
      if (itemNumber !== 1 && itemNumber % itemsPerView === 1) handlePrev()
    } else if (e.keyCode === KEY_CODES.KEY_CODE_TAB) {
      if (itemNumber !== totalItems && itemNumber % itemsPerView === 0) handleNext()
    } else if (e.keyCode === KEY_CODES.KEY_CODE_ENTER || e.keyCode === KEY_CODES.KEY_CODE_SPACE) getSummaryData(data)
  }, [data, getSummaryData, handleNext, handlePrev, itemsPerView, itemNumber, totalItems])

  const colors = useMemo(() => data.colorDefs.slice(1), [data.colorDefs])

  return (
    <ColorStripButton
      onClick={clickHandler}
      onKeyDown={keyDownHandler}
      colors={colors}
    >
      <div
        className='expert-color-pick-button__top-section'
        style={{ backgroundColor: color.hex, color: getContrastYIQ(color.hex) }}
      >
        <div className='expert-color-pick-button__content__wrapper'>
          <div className='expert-color-pick-button__content__wrapper__color-number'>
            {fullColorNumber(color.brandKey, color.colorNumber)}
          </div>
          <div className='expert-color-pick-button__content__wrapper__color-name'>
            {color.name}
          </div>
        </div>
      </div>
    </ColorStripButton>
  )
}

export default ExpertColorPicks
