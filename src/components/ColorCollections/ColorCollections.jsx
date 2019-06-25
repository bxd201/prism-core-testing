// @flow
import React, { useState, useEffect } from 'react'
import CollectionsHeaderWrapper from '../CollectionsHeaderWrapper/CollectionsHeaderWrapper'
import CollectionDetail from './CollectionDetail'
import ColorCollectionsTab from './ColorCollectionsTab'
import { ColorListWithCarousel } from '../Carousel/Carousel'
import { getColorCollectionsData, allCollectionsData, expertColorsData } from '../Carousel/data'
import * as Colors from '../../../__mocks__/data/color/Colors'
import './ColorCollections.scss'
import ExpertColorDetails from '../Carousel/ExpertColorDetails'

type Props = {
  showBack: Function,
  isShowBack: boolean,
  setHeader: Function,
  isExpertColor: boolean
}

const baseClass = 'color-collections'
const colors = Colors.getAllColors()

function ColorCollections (props: Props) {
  const { isShowBack, showBack, setHeader, isExpertColor } = props
  const [tabIdShow, showTab] = useState('tab1')
  const [collectionDataDetails, updateCollectionDataDetails] = useState({})
  const collectionData = (isExpertColor) ? expertColorsData : getColorCollectionsData(colors, allCollectionsData, tabIdShow)
  const headerContent = (isExpertColor) ? 'Expert Color Picks' : 'Color Collections'

  useEffect(() => {
    if (!isShowBack) {
      setHeader(headerContent)
    }
  }, [isShowBack])

  if (isShowBack === true) {
    return (isExpertColor) ? <ExpertColorDetails expertColors={collectionDataDetails} /> : <CollectionDetail collectionDetailData={collectionDataDetails} />
  }

  const onClickHandler = (collectionSummaryData) => {
    showBack()
    if (!isExpertColor) {
      setHeader(collectionSummaryData.name)
    }
    updateCollectionDataDetails(collectionSummaryData)
  }

  const collectionTabs = [
    { id: 'tab1', tabName: 'Most Popular' },
    { id: 'tab2', tabName: 'Color ID' },
    { id: 'tab3', tabName: 'Our Finest Whites' },
    { id: 'tab4', tabName: 'Color Forecast' },
    { id: 'tab5', tabName: 'Pottery Barn' },
    { id: 'tab6', tabName: 'West Elm' },
    { id: 'tab7', tabName: 'Lifestyle' },
    { id: 'tab8', tabName: `Kids' Colors` }
  ]
  return (
    <div className={`${baseClass}__wrapper`}>
      {(isExpertColor) ? '' : <ColorCollectionsTab collectionTabs={collectionTabs} showTab={showTab} tabIdShow={tabIdShow} />}
      <div className={`${baseClass}__collections-list`}>
        <ColorListWithCarousel key={collectionData} data={collectionData} getSummaryData={onClickHandler} isExpertColor={isExpertColor} />
      </div>
    </div>
  )
}

export default CollectionsHeaderWrapper(ColorCollections)
