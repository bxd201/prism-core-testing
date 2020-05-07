// @flow
import React, { useCallback, useMemo, useState, useEffect } from 'react'
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

const ExpertColorPicks = () => {
  const dispatch = useDispatch()
  React.useEffect(() => { loadExpertColorPicks(dispatch) }, [])

  const { messages = {} } = useIntl()
  const [initPosition, setPosition] = useState(0)
  const expertColorPicks = useSelector(state => state.expertColorPicks.data)
  return (
    <CardMenu menuTitle={at(messages, 'EXPERT_COLOR_PICKS')[0]}>
      {(setCardShowing) => (
        <div className='expert-color-picks__wrapper'>
          <div className='expert-color-picks__collections-list'>
            {expertColorPicks.length > 0 && <Carousel
              BaseComponent={ColorStripButtonWrapper}
              btnRefList={[]}
              defaultItemsPerView={8}
              isInfinity={false}
              key='expertcolorpicks'
              data={expertColorPicks}
              setInitialPosition={setPosition}
              initPosition={initPosition}
              getSummaryData={collectionSummaryData => setCardShowing(<ExpertColorDetails expertColors={collectionSummaryData} />)}
            />}
          </div>
        </div>
      )}
    </CardMenu>
  )
}

const ColorStripButtonWrapper = (props: any) => {
  const { data, getSummaryData, onKeyDown, itemNumber, btnRefList } = props
  const clickHandler = useCallback(() => getSummaryData(data), [data])
  const color = data.colorDefs[0]
  const colors = useMemo(() => data.colorDefs.slice(1), [data.colorDefs])
  btnRefList[itemNumber] = React.useRef()

  useEffect(() => {
    if (btnRefList[0].current) {
      btnRefList[0].current.focus()
    }
  }, [btnRefList[0]])

  return (
    <ColorStripButton
      onClick={clickHandler}
      onKeyDown={onKeyDown}
      colors={colors}
      ref={btnRefList[itemNumber]}
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
