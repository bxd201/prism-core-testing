// @flow
import React from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ExpertColorDetails from './ExpertColorDetails'
import CollectionSummary from '../ColorCollections/CollectionSummary'
import Carousel from '../Carousel/Carousel'
import { loadExpertColorPicks } from '../../store/actions/expertColorPicks'
import './ExpertColorPicks.scss'

type SummaryProps = { isShowBack: boolean, setHeader: Function, showBack: Function }

export function ExpertColorPicks ({ isShowBack, showBack, setHeader }: SummaryProps) {
  const [collectionDataDetails, updateCollectionDataDetails] = React.useState({})
  const expertColorPicks = useSelector(state => state.expertColorPicks.data, shallowEqual)
  const dispatch = useDispatch()

  React.useEffect(() => { loadExpertColorPicks()(dispatch) }, [])
  React.useEffect(() => { isShowBack || setHeader('Expert Color Picks') }, [isShowBack])

  return isShowBack
    ? <ExpertColorDetails expertColors={collectionDataDetails} />
    : <div className='expert-color-picks__wrapper'>
      <div className='expert-color-picks__collections-list'>
        {expertColorPicks.length > 0 && <Carousel
          BaseComponent={CollectionSummary}
          defaultItemsPerView={8}
          isInfinity={false}
          key='expertcolorpicks'
          data={expertColorPicks}
          getSummaryData={collectionSummaryData => {
            showBack()
            // sets the data to show on the back of the card
            updateCollectionDataDetails(collectionSummaryData)
          }}
          isExpertColor
        />}
      </div>
    </div>
}

export default CollectionsHeaderWrapper(ExpertColorPicks)
