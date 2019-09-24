// @flow
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import ExpertColorDetails from './ExpertColorDetails'
import React, { useState, useEffect } from 'react'

import { ColorListWithCarousel } from '../Carousel/Carousel'
import { connect } from 'react-redux'
import { loadExpertColorPicks as loadData } from '../../store/actions/expertColorPicks'

import './ExpertColorPicks.scss'

// returns multi-deminseional array, each item of 3 color defs
type SummaryProps = {
  expertColorPicks: Object,
  isShowBack: boolean,
  loadData: Function,
  setHeader: Function,
  showBack: Function
}

const baseClass = 'expert-color-picks'
const wrapper = `${baseClass}__wrapper`

export const collectionsList = `${baseClass}__collections-list`

export function ExpertColorPicks (props: SummaryProps) {
  const [dataLoaded, setDataLoaded] = useState(false)
  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true)
      props.loadData()
    }
  })

  const { isShowBack, showBack, setHeader } = props
  const [collectionDataDetails, updateCollectionDataDetails] = useState({})

  const headerContent = 'Expert Color Picks'

  useEffect(() => {
    if (!isShowBack) {
      setHeader(headerContent)
    }
  }, [isShowBack])

  if (isShowBack === true) {
    return <ExpertColorDetails expertColors={collectionDataDetails} />
  }

  // called by ../Carousel/CollectionSummary
  const onClickHandler = (collectionSummaryData: Object) => {
    showBack()

    // sets the data to show on the back of the card
    updateCollectionDataDetails(collectionSummaryData)
  }

  return (
    <div className={`${wrapper}`}>
      {
        <div className={`${collectionsList}`}>
          <ColorListWithCarousel
            defaultItemsPerView={8}
            isInfinity={false}
            key={'expertcolorpicks'}
            data={props.expertColorPicks.data}
            getSummaryData={onClickHandler}
            isExpertColor
          />
        </div>
      }
    </div>
  )
}

const mapStateToProps = (state) => {
  const { expertColorPicks = { data: [] } } = state

  return { expertColorPicks }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loadData () { dispatch(loadData()) }
  }
}
export default CollectionsHeaderWrapper(connect(
  mapStateToProps,
  mapDispatchToProps
)(ExpertColorPicks))
