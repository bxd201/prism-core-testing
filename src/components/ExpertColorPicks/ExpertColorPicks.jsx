// @flow
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CardMenu from 'src/components/CardMenu/CardMenu'
import ExpertColorDetails from './ExpertColorDetails'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import Carousel from '../Carousel/Carousel'
import { loadExpertColorPicks } from 'src/store/actions/expertColorPicks'
import { fullColorNumber, getContrastYIQ } from 'src/shared/helpers/ColorUtils'
import './ExpertColorPicks.scss'

const ExpertColorPicks = () => {
  const dispatch = useDispatch()
  React.useEffect(() => { loadExpertColorPicks(dispatch) }, [])

  const expertColorPicks = useSelector(state => state.expertColorPicks.data)

  return (
    <CardMenu menuTitle='Expert Color Picks'>
      {(setCardShowing) => (
        <div className='expert-color-picks__wrapper'>
          <div className='expert-color-picks__collections-list'>
            {expertColorPicks.length > 0 && <Carousel
              BaseComponent={({ data, getSummaryData }) => {
                const color = data.colorDefs[0]
                return (
                  <ColorStripButton onClick={() => getSummaryData(data)} colors={data.colorDefs.slice(1)}>
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
              }}
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

export default ExpertColorPicks
