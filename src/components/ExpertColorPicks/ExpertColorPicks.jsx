// @flow
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ExpertColorDetails from './ExpertColorDetails'
import ColorStripButton from 'src/components/ColorStripButton/ColorStripButton'
import Carousel from '../Carousel/Carousel'
import { loadExpertColorPicks } from '../../store/actions/expertColorPicks'
import { fullColorNumber, getContrastYIQ } from '../../shared/helpers/ColorUtils'
import './ExpertColorPicks.scss'

type SummaryProps = { isShowBack: boolean, setHeader: Function, showBack: Function }
export function ExpertColorPicks ({ isShowBack, showBack, setHeader }: SummaryProps) {
  const [collectionDataDetails: Color[], updateCollectionDataDetails] = React.useState([])
  const expertColorPicks = useSelector(state => state.expertColorPicks.data)
  const dispatch = useDispatch()

  React.useEffect(() => { loadExpertColorPicks()(dispatch) }, [])
  React.useEffect(() => { isShowBack || setHeader('Expert Color Picks') }, [isShowBack])

  return isShowBack
    ? <ExpertColorDetails expertColors={collectionDataDetails} />
    : <div className='expert-color-picks__wrapper'>
      <div className='expert-color-picks__collections-list'>
        {expertColorPicks.length > 0 && <Carousel
          BaseComponent={({ data, getSummaryData }) => {
            const baseClass = 'expert-color-pick-button'
            const color = data.colorDefs[0]
            return (
              <ColorStripButton onClick={() => getSummaryData(data)} colors={data.colorDefs.slice(1)}>
                <div className={`${baseClass}__top-section`} style={{ backgroundColor: color.hex, color: getContrastYIQ(color.hex) }}>
                  <div className={`${baseClass}__content__wrapper`}>
                    <div className={`${baseClass}__content__wrapper__color-number`}>{fullColorNumber(color.brandKey, color.colorNumber)}</div>
                    <div className={`${baseClass}__content__wrapper__color-name`}>{color.name}</div>
                  </div>
                </div>
              </ColorStripButton>
            )
          }}
          defaultItemsPerView={8}
          isInfinity={false}
          key='expertcolorpicks'
          data={expertColorPicks}
          getSummaryData={collectionSummaryData => {
            showBack()
            // sets the data to show on the back of the card
            updateCollectionDataDetails(collectionSummaryData)
          }}
        />}
      </div>
    </div>
}

export default CollectionsHeaderWrapper(ExpertColorPicks)
